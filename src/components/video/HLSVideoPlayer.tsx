import React, { useState, useEffect } from 'react';
import { useHLSPlayer } from '../../hooks/useHLSPlayer';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';

interface Props {
  videoUrl: string;
  autoPlay?: boolean;
  poster?: string;
  className?: string;
  muted?: boolean;
}

export const HLSVideoPlayer: React.FC<Props> = ({
  videoUrl, autoPlay, poster, className = '', muted = false
}) => {
  const { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded } = useHLSPlayer(videoUrl, autoPlay);
  const [showControls, setShowControls] = useState(false);

  // 마우스 움직임에 따라 컨트롤 표시/숨김 처리
  useEffect(() => {
    const container = document.querySelector('.video-container');
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout>;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={`video-container relative ${className} aspect-video w-full bg-black`}>
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/60 z-10">로딩 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/60 z-10">{error}</div>}
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full object-contain"
        style={{ background: 'black' }}
        muted={muted}
        autoPlay={autoPlay}
      />
      
      {/* 썸네일 미리보기 컴포넌트 추가 */}
      <VideoThumbnailPreview
        videoElement={videoRef.current}
        getThumbnailAt={getThumbnailAt}
        thumbnailsLoaded={thumbnailsLoaded}
      />
    </div>
  );
};
