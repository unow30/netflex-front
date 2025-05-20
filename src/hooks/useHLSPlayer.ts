import { useEffect, useRef, useState } from 'react';

// 지연 로딩을 위한 동적 import 함수
const loadHls = async () => {
  // 동적으로 Hls 모듈 로드
  const { default: Hls } = await import('hls.js');
  return Hls;
};

// 썸네일 데이터 인터페이스
interface ThumbnailData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useHLSPlayer = (src: string, autoPlay = false, hasInteracted = false) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<number, ThumbnailData>>(new Map());
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false);

  // VTT 파일에서 썸네일 정보 파싱 함수
  const parseVttForThumbnails = async (vttUrl: string) => {
    try {
      // VTT 파일 요청
      const response = await fetch(vttUrl);
      if (!response.ok) {
        throw new Error(`VTT 파일을 로드할 수 없습니다. 상태: ${response.status}`);
      }

      // VTT 텍스트 가져오기
      const text = await response.text();
      // 줄 단위로 분할
      const lines = text.split('\n');
      // 시간별 썸네일 정보를 저장할 맵 생성
      const newThumbnails = new Map<number, ThumbnailData>();
      let currentTime = 0;

      // 각 줄을 순회하며 파싱
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // 타임코드 라인 찾기 (00:00:00.000 --> 00:00:05.000 형식)
        if (line.includes('-->')) {
          // 시작 시간과 종료 시간 분리
          const times = line.split('-->').map(t => t.trim());
          // 시작 시간을 초 단위로 변환
          const startTime = parseTimeToSeconds(times[0]);
          currentTime = startTime;
          
          // 타임코드 다음 줄에 썸네일 정보가 있는지 확인
          if (i + 1 < lines.length) {
            const thumbnailLine = lines[i + 1].trim();
            // 썸네일 좌표 정보 (#xywh=x,y,width,height 형식) 확인
            if (thumbnailLine && thumbnailLine.includes('#xywh=')) {
              try {
                // 이미지 경로와 좌표 부분 분리
                const [imagePath, coordinatesPart] = thumbnailLine.split('#xywh=');
                if (!imagePath || !coordinatesPart) continue;
                
                // x, y, width, height 값 추출 및 숫자로 변환
                const [x, y, width, height] = coordinatesPart.split(',').map(Number);
                if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) continue;
                
                // 상대 경로인 경우 절대 URL로 변환
                const absoluteImageUrl = imagePath.startsWith('http')
                  ? imagePath
                  : new URL(imagePath, vttUrl).href;
                  
                // 현재 시간에 대한 썸네일 정보 저장
                newThumbnails.set(currentTime, {
                  url: absoluteImageUrl,
                  x, y, width, height
                });
              } catch (err) {
                // 파싱 오류 무시
              }
            }
          }
        }
      }
      
      // 썸네일 정보가 있으면 상태 업데이트
      if (newThumbnails.size > 0) {
        setThumbnails(newThumbnails);
        setThumbnailsLoaded(true);
      } else {
        setThumbnailsLoaded(false);
      }
    } catch (err) {
      console.error('VTT 파싱 오류:', err);
      setThumbnailsLoaded(false);
    }
  };

  // 시간 문자열을 초 단위로 변환
  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':');
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return seconds;
  };

  // 특정 시간의 썸네일 데이터 가져오기
  const getThumbnailAt = (time: number): ThumbnailData | null => {
    if (!thumbnailsLoaded || thumbnails.size === 0) return null;
    
    const timeKeys = Array.from(thumbnails.keys()).sort((a, b) => a - b);
    if (timeKeys.length === 0) return null;
    
    const closestTime = timeKeys.reduce((prev, curr) =>
      Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev, timeKeys[0]
    );
    
    return thumbnails.get(closestTime) || null;
  };

  useEffect(() => {
    let hls: any = null;
    let isDestroyed = false;

    const initPlayer = async () => {
      if (!videoRef.current || !src) return;
      setLoading(true);
      setError(null);

      try {
        const video = videoRef.current;
        
        // 기존 HLS 인스턴스 정리
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // 네이티브 HLS 지원 (Safari 등)
          video.src = src;
          setLoading(false);
          
          // 썸네일 VTT 파일 로드 시도
          try {
            const baseUrl = src.substring(0, src.lastIndexOf('/') + 1);
            const vttUrl = `${baseUrl}origin_segment_Thumbnail_I-Frame.vtt`;
            await parseVttForThumbnails(vttUrl);
          } catch (err) {
            console.error('썸네일 로드 실패:', err);
          }
        } else {
          // HLS.js 사용 (Chrome, Firefox 등)
          try {
            const Hls = await loadHls();
            
            if (isDestroyed) return;
            
            if (Hls.isSupported()) {
              hls = new Hls({
                // HLS 구성 옵션
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                enableWorker: true,
              });
              
              hlsRef.current = hls;
              hls.loadSource(src);
              hls.attachMedia(video);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLoading(false);
                
                // 썸네일 VTT 파일 로드 시도
                try {
                  // 소스 URL에서 기본 경로 추출
                  const sourceUrl = new URL(src);
                  const baseUrl = sourceUrl.href.substring(0, sourceUrl.href.lastIndexOf('/') + 1);
                  const vttFileName = 'origin_segment_Thumbnail_I-Frame.vtt';
                  
                  // 자막 트랙에서 썸네일 VTT 찾기
                  const subtitleTracks = hls.subtitleTracks || [];
                  if (subtitleTracks.length > 0) {
                    const vttTrack = subtitleTracks.find((track: any) =>
                      track.url && track.url.includes('.vtt')
                    );
                    if (vttTrack && vttTrack.url) {
                      if (vttTrack.url.includes('Thumbnail')) {
                        parseVttForThumbnails(vttTrack.url);
                        return;
                      }
                    }
                  }
                  
                  // 직접 VTT URL 생성 시도
                  const vttUrl = `${baseUrl}${vttFileName}`;
                  parseVttForThumbnails(vttUrl);
                } catch (err) {
                  console.error('썸네일 로드 실패:', err);
                }
              });

              hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.log('네트워크 오류');
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log('미디어 오류');
                      hls.recoverMediaError();
                      break;
                    default:
                      setError('비디오를 재생할 수 없습니다.');
                      break;
                  }
                }
              });

            } else {
              setError('HLS를 지원하지 않는 브라우저입니다.');
            }
          } catch (err) {
            console.error('HLS 모듈 로딩 중 오류:', err);
            setError('비디오 플레이어를 로드하는데 문제가 발생했습니다.');
          }
        }
      } catch (err) {
        console.error('플레이어 초기화 중 오류:', err);
        setError('비디오 플레이어를 초기화하는데 문제가 발생했습니다.');
      }
    };

    initPlayer();

    return () => {
      isDestroyed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded };
};
