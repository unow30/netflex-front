import React, { forwardRef } from 'react';

interface ProgressBarProps {
  progress: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(({
  progress,
  onClick,
  onMouseMove,
  onMouseLeave
}, ref) => (
  <div
    ref={ref}
    className="progress-container h-12 relative cursor-pointer bg-black/80 rounded mb-8 w-full mx-auto"
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
        height: 8,
        background: '#222',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 6,
        zIndex: 10
      }}
    />
    {/* 빨간 진행선 */}
    <div
      className="progress-filled absolute left-0"
      style={{
        width: `${progress}%`,
        height: 8,
        background: '#ef4444',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 6,
        zIndex: 11
      }}
    />
    {/* 핸들(빨간 원) */}
    <div
      className="progress-handle absolute bg-red-500 rounded-full"
      style={{
        left: `${progress}%`,
        top: '50%',
        width: 16,
        height: 16,
        transform: 'translate(-50%, -50%)',
        zIndex: 12
      }}
    />
  </div>
));
