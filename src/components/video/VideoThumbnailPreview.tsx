import React, { useEffect, useRef, useState } from 'react';

interface ThumbnailData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fullImageWidth?: number; // 전체 타일 이미지의 가로
  fullImageHeight?: number; // 전체 타일 이미지의 세로
}

interface Props {
  videoElement: HTMLVideoElement | null;
  getThumbnailAt: (time: number) => ThumbnailData | null;
  thumbnailsLoaded: boolean;
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
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [thumbnail, setThumbnail] = useState<ThumbnailData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageCache = useRef<{ [url: string]: boolean }>({});
  const progressBarRef = useRef<HTMLProgressElement | HTMLDivElement | HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoElement) return;
    setTimeout(() => {
      const container = videoElement.closest('.video-container') || videoElement.parentElement;
      if (!container) return;
      const selectors = [
        'video::-webkit-media-controls-timeline',
        '.vjs-progress-holder',
        'progress',
        'input[type="range"]',
        '.progress-bar',
        'video::-webkit-media-controls-panel',
        '.video-progress',
        '.progress-bar-container',
        '.timeline',
        '.controls .progress',
      ];
      for (const selector of selectors) {
        const element = container.querySelector(selector);
        if (element) {
          progressBarRef.current = element as HTMLProgressElement | HTMLDivElement;
          break;
        }
      }
      if (!progressBarRef.current) {
        progressBarRef.current = videoElement;
      }
    }, 500);
  }, [videoElement]);

  useEffect(() => {
    if (!videoElement || !thumbnailsLoaded) return;
    const videoContainer = videoElement.closest('.video-container') || videoElement.parentElement;
    if (!videoContainer) return;
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const isControlElement = (mouseEvent.target as HTMLElement).closest('.video-container');
      if (!isControlElement) return;
      const rect = videoContainer.getBoundingClientRect();
      const relativeX = (mouseEvent.clientX - rect.left) / rect.width;
      const timeInSeconds = videoElement.duration * relativeX;
      if (isNaN(timeInSeconds)) return;
      const progressRegionStartY = rect.top + rect.height * 0.75;
      const isInProgressRegion = mouseEvent.clientY >= progressRegionStartY && mouseEvent.clientY <= rect.bottom;
      if (isInProgressRegion) {
        setPosition({
          x: mouseEvent.clientX,
          y: progressRegionStartY - 10,
        });
        setCurrentTime(timeInSeconds);
        const thumbData = getThumbnailAt(timeInSeconds);
        setThumbnail(thumbData);
        setVisible(!!thumbData);
      } else {
        setVisible(false);
      }
    };
    const handleMouseLeave = () => {
      setVisible(false);
    };
    videoContainer.addEventListener('mousemove', handleMouseMove);
    videoContainer.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      videoContainer.removeEventListener('mousemove', handleMouseMove);
      videoContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [videoElement, thumbnailsLoaded, getThumbnailAt]);

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
  // 전체 타일 이미지의 크기 (있으면 사용, 없으면 auto)
  const fullImageWidth = thumbnail.fullImageWidth;
  const fullImageHeight = thumbnail.fullImageHeight;

  // clamp 좌표 계산
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));
  let previewLeft = clamp(position.x - displayWidth / 2, 0, window.innerWidth - displayWidth);
  let previewTop = clamp(position.y - displayHeight - 12, 0, window.innerHeight - displayHeight);

  // background-size: 전체 원본 이미지 크기, background-position: -x, -y
  const previewStyle: React.CSSProperties = {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    left: previewLeft,
    top: previewTop,
    backgroundImage: loaded ? `url(${thumbnail.url})` : undefined,
    backgroundPosition: `-${thumbnail.x}px -${thumbnail.y}px`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: fullImageWidth && fullImageHeight ? `${fullImageWidth}px ${fullImageHeight}px` : 'auto',
    backgroundColor: '#222',
    border: '1px solid #333',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 10,
    overflow: 'hidden',
  };

  return (
    <div
      className={`thumbnail-preview rounded overflow-hidden bg-black shadow-md flex flex-col items-center ${className}`}
      style={previewStyle}
      ref={containerRef}
    >
      {!loaded && !error && LOADING_INDICATOR}
      {error && (
        <div className="text-red-500 text-xs w-full h-full flex items-center justify-center">썸네일 로드 실패</div>
      )}
    </div>
  );
};
