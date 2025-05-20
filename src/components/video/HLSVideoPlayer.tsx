import React, {useEffect, useRef, useState} from 'react';
import {useHLSPlayer} from '../../hooks/useHLSPlayer';
import {ProgressBar} from './ProgressBar';
import ControlRow from './ControlRow';

interface Props {
  videoUrl: string;
  autoPlay?: boolean;
  poster?: string;
  className?: string;
  muted?: boolean;
  initialTime?: number;
  hasInteracted?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onMutedChange?: (isMuted: boolean) => void;
}

const SESSION_USER_PREFERRED_MUTED_STATE = 'user_preferred_muted_state';
const SESSION_USER_HAS_INTERACTED = 'user_has_interacted';

export const HLSVideoPlayer: React.FC<Props> = ({
  videoUrl, autoPlay, poster, className = '', muted = false,
  initialTime = 0, hasInteracted = false, onTimeUpdate, onMutedChange
}) => {
  const { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded } = useHLSPlayer(videoUrl, false, hasInteracted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const storedMutedState = sessionStorage.getItem(SESSION_USER_PREFERRED_MUTED_STATE);
  const initialMuted = storedMutedState ? storedMutedState === 'muted' : false;
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState(0);
  const [progressBarRect, setProgressBarRect] = useState<DOMRect>({ width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => { } });
  const [videoStarted, setVideoStarted] = useState(false);
  const userPausedRef = useRef<boolean>(false);
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const initialTimeApplied = useRef<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = true;
    } else {
      video.muted = false;
    }

    if (onMutedChange) {
      onMutedChange(isMuted);
    }
  }, [isMuted, videoRef, onMutedChange]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume, videoRef]);

  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
          setCurrentTime(video.currentTime);
          setDuration(video.duration);
          
          if (onTimeUpdate) {
            onTimeUpdate(video.currentTime);
          }
        }
      }
    };
    
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', updateProgress);
    
    video.addEventListener('ended', () => {
      setIsPlaying(false);
      if (onTimeUpdate) {
        onTimeUpdate(0);
      }
    });
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', () => {
        setIsPlaying(false);
      });
    };
  }, [videoRef, onTimeUpdate]);

  useEffect(() => {
    const handleMouseMove = () => {
      setControlsVisible(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    };
    
    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => {});
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applyInitialTime = () => {
      if (initialTime > 0 && !initialTimeApplied.current) {
        video.currentTime = initialTime;
        initialTimeApplied.current = true;
      }
    };

    if (video.readyState >= 1) {
      applyInitialTime();
    } else {
      video.addEventListener('loadedmetadata', applyInitialTime);
    }

    return () => {
      video.removeEventListener('loadedmetadata', applyInitialTime);
    };
  }, [videoRef, initialTime, onTimeUpdate, onMutedChange]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleLoadedData = () => {
      if (video.readyState >= 2) {
        setDuration(video.duration);
      }
    };

    const handlePageVisibility = () => {
      if (!video.paused && document.visibilityState === 'hidden') {
        userPausedRef.current = true;
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setVideoStarted(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handlePageVisibility);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handlePageVisibility);
    };
  }, [videoRef.current]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (bar && videoRef.current) {
      const rect = bar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = videoRef.current.duration * clickPosition;
      
      videoRef.current.currentTime = newTime;
      setProgress(clickPosition * 100);
      setCurrentTime(newTime);
      
      if (onTimeUpdate) {
        onTimeUpdate(newTime);
      }
    }
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (bar && videoRef.current) {
      const rect = bar.getBoundingClientRect();
      setProgressBarRect(rect);
      const hoverPosition = (e.clientX - rect.left) / rect.width;
      const previewTimeValue = videoRef.current.duration * hoverPosition;
      
      setPreviewTime(previewTimeValue);
      setPreviewLeft(e.clientX - rect.left);
      
      if (previewTime !== null && getThumbnailAt && getThumbnailAt(previewTime)) {
        const thumbData = getThumbnailAt(previewTime);
        if (thumbData) {
          console.log('썸네일 좌표: x=', thumbData.x, 'y=', thumbData.y, 'width=', thumbData.width, 'height=', thumbData.height);
        }
      }
    }
  };

  const handleProgressMouseLeave = () => {
    setPreviewTime(null);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(err => {
        console.error('재생 에러:', err);
      });
      setIsPlaying(true);
      userPausedRef.current = false;
      sessionStorage.setItem(SESSION_USER_HAS_INTERACTED, 'true');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      userPausedRef.current = true;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    sessionStorage.setItem(
      SESSION_USER_PREFERRED_MUTED_STATE,
      newMutedState ? 'muted' : 'unmuted'
    );
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
      sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, 'muted');
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, 'unmuted');
    }
  };

  const handleVolumeEnter = () => {
    setShowVolume(true);
  };

  const handleVolumeLeave = () => {
    setShowVolume(false);
  };

  const handleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const container = videoContainerRef.current;
    if (!container) return;
    
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('전체화면 전환 에러:', err);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70 text-white">
          <div className="text-xl">비디오 로딩 중...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70 text-white">
          <div className="text-xl text-red-500">비디오를 로드할 수 없습니다: {error}</div>
        </div>
      )}

      <div className="relative flex justify-center items-center">
        {poster && !videoStarted && (
          <div 
            className="absolute inset-0 z-5 bg-center bg-cover cursor-pointer"
            style={{ backgroundImage: `url('${poster}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            onClick={(e) => handlePlayPause(e)}
          />
        )}
        
        <video
          ref={videoRef}
          preload="auto"
          className="w-full h-auto cursor-pointer"
          onClick={(e) => handlePlayPause(e)}
          playsInline
          poster={poster}
          data-has-interacted={hasInteracted ? 'true' : 'false'}
          data-video-started={videoStarted ? 'true' : 'false'}
        >
          {videoUrl && <source src={videoUrl} type="application/x-mpegURL" />}
          브라우저가 비디오를 지원하지 않습니다.
        </video>

        {(!isPlaying || loading) && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            onClick={(e) => handlePlayPause(e)}
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

      <div className="bg-black text-white pt-2 pb-3 px-2">
        <ProgressBar
          progress={progress}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          ref={progressBarRef}
        />

        {previewTime !== null && thumbnailsLoaded && (
          <div
            className="absolute bg-black border border-gray-700 shadow-lg z-20"
            style={{
              left: `${Math.min(Math.max(0, previewLeft - 80), progressBarRect.width - 160)}px`,
              bottom: `${progressBarRef.current ? progressBarRef.current.clientHeight + 50 : 70}px`,
              transform: "translateX(0)",
            }}
          >
            {getThumbnailAt && true && getThumbnailAt(previewTime) && (
              <div 
                className="relative overflow-hidden bg-black/80"
                style={{
                  width: `${getThumbnailAt(previewTime)?.width || 160}px`,
                  height: `${getThumbnailAt(previewTime)?.height || 90}px`,
                }}
              >
                <img
                  src={getThumbnailAt(previewTime)?.url || ''}
                  alt="썸네일 미리보기"
                  style={{
                    position: 'absolute',
                    left: `-${getThumbnailAt(previewTime)?.x || 0}px`,
                    top: `-${getThumbnailAt(previewTime)?.y || 0}px`,
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
        )}

        <ControlRow
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          showVolume={showVolume}
          isFullscreen={fullscreen}
          isTheaterMode={theaterMode}
          currentTime={currentTime}
          formatTime={formatTime}
          onPlayPause={() => handlePlayPause({ stopPropagation: () => {}, preventDefault: () => {} } as React.MouseEvent)}
          onMute={() => toggleMute({ stopPropagation: () => {} } as React.MouseEvent)}
          onVolumeChange={handleVolumeChange}
          onVolumeEnter={handleVolumeEnter}
          onVolumeLeave={handleVolumeLeave}
          onFullscreen={() => handleFullscreen({ stopPropagation: () => {} } as React.MouseEvent)}
          onTheaterMode={() => setTheaterMode(!theaterMode)}
          volumeControlRef={volumeControlRef as React.RefObject<HTMLDivElement>}
        />
      </div>
    </div>
  );
};
