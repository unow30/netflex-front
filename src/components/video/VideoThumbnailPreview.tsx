import React, { useEffect, useRef, useState } from 'react';

interface ThumbnailData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fullImageWidth?: number;
  fullImageHeight?: number;
}

interface Props {
  videoElement: HTMLVideoElement | null;
  getThumbnailAt: (time: number) => ThumbnailData | null;
  thumbnailsLoaded: boolean;
  previewTime?: number | null;
  left?: number;
  progressBarRect?: { left: number; width: number };
  className?: string;
}

const LOADING_INDICATOR = (
  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-zinc-900">
    Loading...
  </div>
);

export const VideoThumbnailPreview: React.FC<Props> = ({
  videoElement,
  getThumbnailAt,
  thumbnailsLoaded,
  previewTime = null,
  left = 0,
  progressBarRect,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [thumbnail, setThumbnail] = useState<ThumbnailData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageCache = useRef<{ [url: string]: boolean }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 썸네일 프리뷰를 보여줄지 결정
    if (!thumbnailsLoaded || previewTime === null || !videoElement) {
      setVisible(false);
      setThumbnail(null);
      return;
    }
    const thumbData = getThumbnailAt(previewTime);
    setThumbnail(thumbData);
    setVisible(!!thumbData);
  }, [thumbnailsLoaded, previewTime, getThumbnailAt, videoElement]);

  useEffect(() => {
    if (!thumbnail || !visible) return;
    if (imageCache.current[thumbnail.url]) {
      setLoaded(true);
      setError(false);
      return;
    }
    setLoaded(false);
    setError(false);
    const img = new window.Image();
    img.onload = () => {
      imageCache.current[thumbnail.url] = true;
      setLoaded(true);
      setError(false);
    };
    img.onerror = () => {
      setLoaded(false);
      setError(true);
    };
    img.src = thumbnail.url;
  }, [thumbnail, visible]);

  if (!visible || !thumbnail) return null;

  // 타일 한 개의 크기
  const displayWidth = thumbnail.width;
  const displayHeight = thumbnail.height;

  // clamp 좌표 계산
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));
  let previewLeft;
  if (progressBarRect && progressBarRect.width) {
    previewLeft = clamp(
      (progressBarRect.left || 0) + (left || 0) - displayWidth / 2,
      progressBarRect.left || 0,
      (progressBarRect.left || 0) + (progressBarRect.width || 0) - displayWidth
    ) - (progressBarRect.left || 0);
  } else {
    previewLeft = clamp(left - displayWidth / 2, 0, window.innerWidth - displayWidth);
  }
  let previewTop = -displayHeight - 12; // progress bar 위에 뜨게

  return (
    <div
      className={`preview-thumbnail rounded bg-black shadow-md ${className}`}
      style={{
        left: previewLeft,
        top: previewTop,
        position: 'absolute',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      ref={containerRef}
    >
      {!loaded && !error && LOADING_INDICATOR}
      {error && <div className="text-xs text-red-500 py-2">썸네일 오류</div>}
      {loaded && !error && (
        <div
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '2px',
          }}
        >
          <img
            src={thumbnail.url}
            alt="썸네일 미리보기"
            style={{
              position: 'absolute',
              left: `-${thumbnail.x}px`,
              top: `-${thumbnail.y}px`,
              maxWidth: 'none',
              maxHeight: 'none',
              width: 'auto',
              height: 'auto',
              background: '#222',
            }}
          />
        </div>
      )}
    </div>
  );
};
