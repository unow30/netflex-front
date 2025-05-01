import React, {useEffect, useRef, useState} from 'react';
import {useHLSPlayer} from '../../hooks/useHLSPlayer';
import {ProgressBar} from './ProgressBar';
import {ControlRow} from './ControlRow';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // 썸네일 프리뷰용 progressBar 위치와 width 계산
  const [progressBarRect, setProgressBarRect] = useState<{left: number, width: number}>({left: 0, width: 0});
  useEffect(() => {
    const updateRect = () => {
      if (progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        setProgressBarRect({ left: rect.left, width: rect.width });
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

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
    video.currentTime = (clickX / rect.width) * video.duration;
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

  // 볼륨 조절
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume, videoRef]);

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
      className={
        theaterMode
          ? "bg-black/90 w-full max-w-[1200px] min-w-0 mx-auto video-player relative box-border mb-6"
          : "bg-black w-full max-w-3xl min-w-0 mx-auto video-player relative box-border mb-6"
      }
      ref={videoContainerRef}
      style={{ aspectRatio: '16/9', overflow: 'visible' }}
    >
      <div className="w-full h-full flex flex-col min-w-0">
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
          onClick={handlePlayPause}
        />
        <ProgressBar
          progress={progress}
          progressBarRef={progressBarRef}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          previewTime={previewTime}
          previewLeft={previewLeft}
          getThumbnailAt={getThumbnailAt}
          thumbnailsLoaded={thumbnailsLoaded}
          videoElement={videoRef.current}
          progressBarRect={progressBarRect}
        />
        {/* 여백 div 제거: 일반/영화관/전체화면에서 동일하게 보이도록 롤백 */}
        <ControlRow
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          showVolume={showVolume}
          setShowVolume={setShowVolume}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          currentTime={currentTime}
          formatTime={formatTime}
          onFullscreen={handleFullscreen}
          fullscreen={fullscreen}
          onToggleTheaterMode={() => setTheaterMode(v => !v)}
          theaterMode={theaterMode}
        />
      </div>
    </div>
  );
};
