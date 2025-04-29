import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface ThumbnailData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useHLSPlayer(videoUrl: string, autoPlay: boolean = false) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<number, ThumbnailData>>(new Map());
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(false);

  // 현재 시간을 기준으로 가장 가까운 썸네일 데이터 반환
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
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;
    setLoading(true);
    setError(null);

    function clearError() {
      setError(null);
    }

    // VTT 파일에서 썸네일 정보 파싱 함수
    async function parseVttForThumbnails(vttUrl: string) {
      try {
        const response = await fetch(vttUrl);
        if (!response.ok) {
          throw new Error(`VTT 파일을 로드할 수 없습니다. 상태: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        const newThumbnails = new Map<number, ThumbnailData>();
        let currentTime = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.includes('-->')) {
            const times = line.split('-->').map(t => t.trim());
            const startTime = parseTimeToSeconds(times[0]);
            currentTime = startTime;
            if (i + 1 < lines.length) {
              const thumbnailLine = lines[i + 1].trim();
              if (thumbnailLine && thumbnailLine.includes('#xywh=')) {
                try {
                  const [imagePath, coordinatesPart] = thumbnailLine.split('#xywh=');
                  if (!imagePath || !coordinatesPart) continue;
                  const [x, y, width, height] = coordinatesPart.split(',').map(Number);
                  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) continue;
                  const absoluteImageUrl = imagePath.startsWith('http')
                    ? imagePath
                    : new URL(imagePath, vttUrl).href;
                  newThumbnails.set(currentTime, {
                    url: absoluteImageUrl,
                    x, y, width, height
                  });
                } catch (err) {
                  // ignore parse error
                }
              }
            }
          }
        }
        if (newThumbnails.size > 0) {
          setThumbnails(newThumbnails);
          setThumbnailsLoaded(true);
        } else {
          setThumbnailsLoaded(false);
        }
      } catch (err) {
        setThumbnailsLoaded(false);
      }
    }

    function formatTime(seconds: number): string {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return h > 0
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
        : `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    function parseTimeToSeconds(timeString: string): number {
      const parts = timeString.split(':');
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
      } else if (parts.length === 2) {
        seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
      }
      return seconds;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        debug: false
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
        try {
          if (!hls) return;
          const sourceUrl = new URL(videoUrl);
          const baseUrl = sourceUrl.href.substring(0, sourceUrl.href.lastIndexOf('/') + 1);
          const vttFileName = 'origin_segment_Thumbnail_I-Frame.vtt';
          const subtitleTracks = hls.subtitleTracks || [];
          if (subtitleTracks.length > 0) {
            const vttTrack = subtitleTracks.find((track) =>
              track.url && track.url.includes('.vtt')
            );
            if (vttTrack && vttTrack.url) {
              if (vttTrack.url.includes('Thumbnail')) {
                parseVttForThumbnails(vttTrack.url);
                return;
              }
            }
          }
          const vttUrl = `${baseUrl}${vttFileName}`;
          parseVttForThumbnails(vttUrl);
        } catch (err) {}
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        setError('비디오 재생 오류');
        setLoading(false);
        if (data.fatal && hls) hls.destroy();
      });
      video.addEventListener('playing', clearError);
      video.addEventListener('play', clearError);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
        const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);
        const vttUrl = `${baseUrl}origin_segment_Thumbnail_I-Frame.vtt`;
        parseVttForThumbnails(vttUrl);
      });
      video.addEventListener('error', (e) => {
        setError('비디오 재생 오류');
        setLoading(false);
      });
      video.addEventListener('playing', clearError);
      video.addEventListener('play', clearError);
    } else {
      setError('HLS를 지원하지 않는 브라우저입니다.');
      setLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
      if (video) {
        video.removeEventListener('playing', clearError);
        video.removeEventListener('play', clearError);
      }
    };
  }, [videoUrl, autoPlay]);

  return { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded };
}
