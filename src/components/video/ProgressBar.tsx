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
    ref={progressBarRef}
    className="progress-container h-12 relative cursor-pointer bg-black/80 rounded mb-5 w-full mx-auto"
    onClick={onClick}
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    style={{ margin: 0, maxWidth: '100%' }}
  >
    {/* 전체 진행바(배경) */}
    <div
      className="progress-bar absolute left-0"
      style={{
        width: '100%',
        height: 6,
        background: '#222',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 6,
        zIndex: 0
      }}
    />
    {/* 빨간 진행선 */}
    <div
      className="progress-filled absolute left-0"
      style={{
        width: `${progress}%`,
        height: 6,
        background: '#ef4444',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 6,
        zIndex: 1
      }}
    />
    {/* 핸들(빨간 원) */}
    <div
      className="progress-handle absolute bg-red-500 rounded-full"
      style={{
        left: `${progress}%`,
        top: '50%',
        width: 14,
        height: 14,
        transform: 'translate(-50%, -50%)',
        zIndex: 2
      }}
    />
    {/* 썸네일 등 추가 요소 */}
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
