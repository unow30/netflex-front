import React, { useState, useRef, useEffect } from 'react';
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
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 비디오 이벤트 핸들러
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => {
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoRef]);

  // 재생/일시정지
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      video.play();
    } else {
      video.pause();
    }
  };

  // 프로그레스바 클릭 시 탐색
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * video.duration;
    video.currentTime = newTime;
  };

  // 프로그레스바 썸네일 프리뷰
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const previewTime = percent * video.duration;
    setPreviewTime(previewTime);
    setPreviewLeft(x);
  };
  const handleProgressMouseLeave = () => {
    setPreviewTime(null);
  };

  // 전체화면 토글
  const handleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 전체화면 상태 관리
  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  return (
    <div
      className={`video-player bg-black relative w-full max-w-3xl mx-auto${fullscreen ? ' fullscreen' : ''}`}
      ref={videoContainerRef}
      style={{ aspectRatio: '16/9' }}
    >
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/60 z-10">로딩 중...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/60 z-10">{error}</div>}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        style={{ background: 'black' }}
        muted={muted}
        autoPlay={autoPlay}
        tabIndex={-1}
      />
      {/* 커스텀 컨트롤 */}
      <div className="controls absolute bottom-4 left-4 right-4 flex items-center gap-3 text-yellow-300 z-20 bg-black/40 rounded p-2">
        <button onClick={handlePlayPause} className="play-btn text-2xl">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div
          className="progress-container flex-1 h-3 relative cursor-pointer"
          ref={progressBarRef}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
        >
          <div className="progress-bar w-full h-full bg-white rounded">
            <div className="progress-filled bg-red-500 h-full rounded" style={{ width: `${progress}%` }} />
            <div className="progress-handle absolute top-1/2 bg-red-500 rounded-full" style={{ left: `${progress}%`, width: 14, height: 14, transform: 'translate(-50%, -50%)' }} />
          </div>
          {/* 썸네일 프리뷰 */}
          <VideoThumbnailPreview
            videoElement={videoRef.current}
            getThumbnailAt={getThumbnailAt}
            thumbnailsLoaded={thumbnailsLoaded}
            previewTime={previewTime}
            left={previewLeft}
          />
        </div>
        <div className="time-display min-w-[48px] text-right">{formatTime(currentTime)}</div>
        <button onClick={handleFullscreen} className="fullscreen-btn text-2xl ml-auto">
          {fullscreen ? '🡼' : '⛶'}
        </button>
      </div>
    </div>
  );
};
