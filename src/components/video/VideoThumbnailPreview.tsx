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

  // background-size: 전체 원본 이미지 크기, background-position: -x, -y
  const previewStyle: React.CSSProperties = {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    left: previewLeft,
    top: previewTop,
    position: 'absolute',
    zIndex: 10,
    overflow: 'hidden',
    pointerEvents: 'none',
  };

  return (
    <div
      className={`preview-thumbnail rounded overflow-hidden bg-black shadow-md flex flex-col items-center ${className}`}
      style={previewStyle}
      ref={containerRef}
    >
      {!loaded && !error && LOADING_INDICATOR}
      {error && <div className="text-xs text-red-500 py-2">썸네일 오류</div>}
      {loaded && !error && (
        <img
          src={thumbnail.url}
          alt="썸네일 미리보기"
          style={{
            width: thumbnail.fullImageWidth || displayWidth,
            height: thumbnail.fullImageHeight || displayHeight,
            objectFit: 'none',
            objectPosition: `-${thumbnail.x}px -${thumbnail.y}px`,
            background: '#222',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}
        />
      )}
      {loaded && !error && (
        <span className="text-xs mt-1 text-gray-400 bg-black/70 px-2 rounded">
          {Math.floor(previewTime! / 60)}:{((previewTime! % 60) | 0).toString().padStart(2, '0')}
        </span>
      )}
    </div>
  );
};
