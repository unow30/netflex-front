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
  initialTime?: number; // 초기 재생 시간 위치
  hasInteracted?: boolean; // 사용자가 이미 상호작용했는지 여부
  onTimeUpdate?: (currentTime: number) => void; // 재생 시간 업데이트 콜백
  onMutedChange?: (isMuted: boolean) => void; // 음소거 상태 변경 콜백
}

export const HLSVideoPlayer: React.FC<Props> = ({
  videoUrl, autoPlay, poster, className = '', muted = false,
  initialTime = 0, hasInteracted = false, onTimeUpdate, onMutedChange
}) => {
  const { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded } = useHLSPlayer(videoUrl, autoPlay, hasInteracted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const initialTimeApplied = useRef(false);
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

  // 초기 muted 상태 설정
  useEffect(() => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // 초기 재생 시간 설정
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !initialTimeApplied.current) {
      videoRef.current.currentTime = initialTime;
      initialTimeApplied.current = true;
    }
  }, [initialTime, videoRef.current]);

  // 사용자 상호작용 상태에 따른 자동 재생 처리
  useEffect(() => {
    const tryAutoplay = async () => {
      if (videoRef.current && hasInteracted) {
        try {
          // 자동 재생 시도
          await videoRef.current.play();
        } catch (error) {
          console.warn('자동 재생 실패:', error);
          // 음소거 상태로 다시 시도
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            try {
              await videoRef.current.play();
            } catch (innerError) {
              console.error('음소거 상태에서도 자동 재생 실패:', innerError);
            }
          }
        }
      }
    };
    
    tryAutoplay();
  }, [hasInteracted, videoRef.current]);

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
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
      
      // 시간 업데이트 콜백 실행
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };
    
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      // 초기 시간 설정이 필요하다면 여기서 설정
      if (initialTime > 0 && !initialTimeApplied.current) {
        video.currentTime = initialTime;
        initialTimeApplied.current = true;
      }
    };
    
    const onVolumeChange = () => {
      if (onMutedChange) {
        onMutedChange(video.muted);
      }
      setIsMuted(video.muted);
    };
    
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('volumechange', onVolumeChange);
    
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [videoRef, initialTime, onTimeUpdate, onMutedChange]);

  // 재생/일시정지
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      
      // 사용자 상호작용을 통해 재생을 시도하는 경우
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('재생 에러:', error);
          // 음소거 상태로 재생 시도
          video.muted = true;
          setIsMuted(true);
          if (onMutedChange) onMutedChange(true);
          video.play().catch(e => console.error('음소거 상태에서도 재생 실패:', e));
        });
      }
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
  
  // 음소거 토글
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
    
    if (onMutedChange) {
      onMutedChange(video.muted);
    }
  };
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

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
          ? "bg-black/90 w-full max-w-[1200px] min-w-0 mx-auto video-player relative box-border mb-12 overflow-visible"
          : "bg-black w-full max-w-3xl min-w-0 mx-auto video-player relative box-border mb-12 overflow-visible"
      }
      ref={videoContainerRef}
    >
      {/* 로딩 표시 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70 text-white">
          <div className="text-xl">비디오 로딩 중...</div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70 text-white">
          <div className="text-xl text-red-500">비디오를 로드할 수 없습니다: {error}</div>
        </div>
      )}

      {/* 비디오 요소 */}
      <div className="relative flex justify-center items-center">
        <video
          ref={videoRef}
          preload="auto"
          className="w-full h-auto"
          onClick={handlePlayPause}
          playsInline
          poster={poster}
          data-has-interacted={hasInteracted ? 'true' : 'false'}
        >
          {videoUrl && <source src={videoUrl} type="application/x-mpegURL" />}
          브라우저가 비디오를 지원하지 않습니다.
        </video>

        {/* 재생 버튼 중앙 오버레이 */}
        {(!isPlaying || loading) && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
          >
            <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 영역 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2">
        {/* 프로그레스 바 */}
        <ProgressBar
          progress={progress}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          ref={progressBarRef}
        />

        {/* 타임라인 위 썸네일 미리보기 */}
        {previewTime !== null && thumbnailsLoaded && (
          <div
            className="absolute bottom-10 bg-black border border-gray-700 shadow-lg z-20"
            style={{
              left: `${Math.min(Math.max(0, previewLeft - 80), progressBarRect.width - 160)}px`,
              transform: "translateX(0)",
            }}
          >
            {getThumbnailAt && (
              <div className="w-40 h-24 relative overflow-hidden bg-black/80">
                {/* 썸네일 이미지 컨텐츠는 여기에 표시됩니다 */}
                {previewTime !== null && getThumbnailAt(previewTime) && (
                  <img
                    src={getThumbnailAt(previewTime)?.url || ''}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className="p-1 text-xs text-center">{formatTime(previewTime)}</div>
          </div>
        )}

        {/* 컨트롤 버튼 영역 */}
        <ControlRow
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          showVolume={showVolume}
          isFullscreen={fullscreen}
          isTheaterMode={theaterMode}
          currentTime={currentTime}
          formatTime={formatTime}
          onPlayPause={handlePlayPause}
          onMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onVolumeEnter={() => setShowVolume(true)}
          onVolumeLeave={() => setShowVolume(false)}
          onFullscreen={handleFullscreen}
          onTheaterMode={() => setTheaterMode(!theaterMode)}
        />
      </div>
    </div>
  );
};
