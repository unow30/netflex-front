import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export function useHLSPlayer(videoUrl: string, autoPlay: boolean = false) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let hls: Hls | null = null;
    setLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        setError('비디오 재생 오류');
        setLoading(false);
        if (data.fatal && hls) hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setError('비디오 재생 오류');
        setLoading(false);
      });
    } else {
      setError('HLS를 지원하지 않는 브라우저입니다.');
      setLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoUrl, autoPlay]);

  return { videoRef, loading, error };
}
