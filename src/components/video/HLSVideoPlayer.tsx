import React from 'react';
import { useHLSPlayer } from '../../hooks/useHLSPlayer';

interface Props {
  videoUrl: string;
  autoPlay?: boolean;
  poster?: string;
  className?: string;
}

export const HLSVideoPlayer: React.FC<Props> = ({
  videoUrl, autoPlay = false, poster, className = ''
}) => {
  const { videoRef, loading, error } = useHLSPlayer(videoUrl, autoPlay);

  return (
    <div className={`${className} aspect-video w-full bg-black relative`}>
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/60 z-10">로딩 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/60 z-10">{error}</div>}
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full object-contain"
        style={{ background: 'black' }}
      />
    </div>
  );
};
