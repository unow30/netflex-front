import React from 'react';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';

interface ProgressBarProps {
  progress: number;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  previewTime: number | null;
  previewLeft: number;
  getThumbnailAt: (time: number) => any;
  thumbnailsLoaded: boolean;
  videoElement: HTMLVideoElement | null;
  progressBarRect: { left: number; width: number };
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  progressBarRef,
  onClick,
  onMouseMove,
  onMouseLeave,
  previewTime,
  previewLeft,
  getThumbnailAt,
  thumbnailsLoaded,
  videoElement,
  progressBarRect
}) => (
  <div
    className="progress-container h-3 relative cursor-pointer bg-black/40 rounded mb-2 w-full mx-auto"
    ref={progressBarRef}
    onClick={onClick}
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    style={{ margin: 0, maxWidth: '100%' }}
  >
    <div className="progress-bar w-full h-full bg-white rounded">
      <div className="progress-filled bg-red-500 h-full rounded" style={{ width: `${progress}%` }} />
      <div className="progress-handle absolute top-1/2 bg-red-500 rounded-full" style={{ left: `${progress}%`, width: 14, height: 14, transform: 'translate(-50%, -50%)' }} />
    </div>
    <VideoThumbnailPreview
      videoElement={videoElement}
      getThumbnailAt={getThumbnailAt}
      thumbnailsLoaded={thumbnailsLoaded}
      previewTime={previewTime}
      left={previewLeft}
      progressBarRect={progressBarRect}
    />
  </div>
);
