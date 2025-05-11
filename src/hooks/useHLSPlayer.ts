import { useEffect, useRef, useState } from 'react';

// 지연 로딩을 위한 동적 import 함수
const loadHls = async () => {
  // 동적으로 Hls 모듈 로드
  const { default: Hls } = await import('hls.js');
  return Hls;
};

export const useHLSPlayer = (src: string, autoPlay = false) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false);
  const thumbnailsRef = useRef<Record<number, string>>({});

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
          if (autoPlay) {
            try {
              await video.play();
            } catch (err) {
              console.log('자동 재생 실패:', err);
            }
          }
          setLoading(false);
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
              });
              
              hlsRef.current = hls;
              hls.loadSource(src);
              hls.attachMedia(video);

              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLoading(false);
                if (autoPlay) {
                  try {
                    video.play();
                  } catch (err) {
                    console.log('자동 재생 실패:', err);
                  }
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

              // 썸네일 추출 관련 로직은 필요할 때 처리

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
  }, [src, autoPlay]);

  // 썸네일 가져오기 함수
  const getThumbnailAt = (time: number): string | null => {
    // 썸네일 관련 로직을 필요할 때만 동적으로 처리
    return null;
  };

  return { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded };
};
