import React, {useEffect, useRef, useState} from 'react';
import {useHLSPlayer} from '../../hooks/useHLSPlayer';
import {ProgressBar} from './ProgressBar';
import ControlRow from './ControlRow'; // named export에서 default export로 변경

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

// 세션 스토리지 키 상수
const SESSION_USER_PREFERRED_MUTED_STATE = 'user_preferred_muted_state';
const SESSION_USER_HAS_INTERACTED = 'user_has_interacted';

export const HLSVideoPlayer: React.FC<Props> = ({
  videoUrl, autoPlay, poster, className = '', muted = false,
  initialTime = 0, hasInteracted = false, onTimeUpdate, onMutedChange
}) => {
  // autoPlay는 false로 강제 설정
  const { videoRef, loading, error, getThumbnailAt, thumbnailsLoaded } = useHLSPlayer(videoUrl, false, hasInteracted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  // 세션에 저장된 음소거 상태 불러오기
  const storedMutedState = sessionStorage.getItem(SESSION_USER_PREFERRED_MUTED_STATE);
  // 세션에 값이 없으면 기본값 unmuted(false) 사용, 값이 있으면 그 값 사용
  const initialMuted = storedMutedState ? storedMutedState === 'muted' : false;
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState(0);
  const [progressBarRect, setProgressBarRect] = useState<DOMRect>({ width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => { } });
  // 비디오가 실제로 재생을 시작했는지 추적
  const [videoStarted, setVideoStarted] = useState(false);
  // 사용자가 명시적으로 일시정지했는지 여부를 추적
  const userPausedRef = useRef<boolean>(false);
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const initialTimeApplied = useRef<boolean>(false);

  // 썸네일 프리뷰용 progressBar 위치와 width 계산
  useEffect(() => {
    const updateRect = () => {
      if (progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        setProgressBarRect(rect);
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // 비디오 로드 시 초기화
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    // 세션 스토리지에서 사용자 음소거 설정 불러오기
    // const userPreferredMutedState = sessionStorage.getItem(SESSION_USER_PREFERRED_MUTED_STATE);

    // 초기 음소거 상태 설정 (세션에 값이 있으면 그 값 사용, 없으면 unmuted(false) 사용)
    if (videoRef.current) {
      if (storedMutedState) {
        const shouldBeMuted = storedMutedState === 'muted';
        console.log("storedMutedState",storedMutedState)
        console.log('shouldBeMuted',shouldBeMuted)
        videoRef.current.muted = shouldBeMuted;
        setIsMuted(shouldBeMuted);
      } else {
        // 세션에 값이 없으면 props가 아닌 unmuted(false) 기본값 사용
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
    
    // 사용자 상호작용 상태 기록
    if (hasInteracted) {
      sessionStorage.setItem(SESSION_USER_HAS_INTERACTED, 'true');
    }

    // 자동 재생 비활성화 - 사용자가 명시적으로 재생 버튼을 눌러야만 재생됨
    // tryAutoplay 함수 및 관련 로직 제거
    
  }, [hasInteracted, onMutedChange, videoUrl]);

  // 초기 재생 시간 설정
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !initialTimeApplied.current) {
      videoRef.current.currentTime = initialTime;
      initialTimeApplied.current = true;
    }
  }, [initialTime, videoRef.current]);

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 재생/일시정지
  const handlePlayPause = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // 이벤트 버블링 방지
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const video = videoRef.current;
    if (!video) return;
    
    // 사용자가 상호작용했다고 표시
    sessionStorage.setItem(SESSION_USER_HAS_INTERACTED, 'true');
    
    // 현재 상태 기준으로 토글
    if (isPlaying) {
      // 현재 재생 중이면 일시정지
      try {
        video.pause();
        // 사용자가 명시적으로 일시정지했음을 표시
        userPausedRef.current = true;
      } catch (error) {
        // console.error('일시정지 중 오류:', error);
      }
    } else {
      // 현재 일시정지 상태면 재생
      if (video.ended) video.currentTime = 0;
      
      try {
        // 사용자가 명시적으로 재생을 시작함
        userPausedRef.current = false;
        
        // 재생 시도
        await video.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('재생 에러:', error);
            // 음소거 상태로 재생 시도
            video.muted = true;
            setIsMuted(true);
            
            // 자동 재생을 위한 일시적 음소거이므로 사용자 설정은 저장하지 않음
            // sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, 'muted');
            
            video.play()
              .then(() => {
                // console.log('음소거 상태로 재생 성공');
              })
              .catch(innerError => {
                // console.error('음소거 상태에서도 재생 실패:', innerError);
              });
          });
      } catch (error) {
        console.error('재생 시도 중 오류:', error);
      }
    }
  };

  // 비디오 이벤트 핸들러
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // 초기 상태 설정
    setIsPlaying(!video.paused);
    
    const onPlay = () => {
      setIsPlaying(true);
    };
    
    const onPause = () => {
      setIsPlaying(false);
    };
    
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
      // 비디오 요소의 음소거 상태를 상태와 동기화
      if (video.muted !== isMuted) {
        setIsMuted(video.muted);
        
        // volumeChange 이벤트는 여러 경우에 발생할 수 있으므로
        // 여기서는 세션 저장소에 저장하지 않음
        
        if (onMutedChange) {
          onMutedChange(video.muted);
        }
      }
    };
    
    // 이벤트 핸들러 등록 전 기존 핸들러 제거
    video.removeEventListener('play', onPlay);
    video.removeEventListener('pause', onPause);
    video.removeEventListener('timeupdate', handleTimeUpdate);
    video.removeEventListener('loadedmetadata', onLoadedMetadata);
    video.removeEventListener('volumechange', onVolumeChange);
    
    // 이벤트 핸들러 등록
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

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // 로딩 완료 시 이벤트
    const handleLoadedData = () => {
      if (video.readyState >= 2) {
        setDuration(video.duration);
      }
    };

    // 페이지 새로고침 시 처리
    const handlePageVisibility = () => {
      if (!video.paused && document.visibilityState === 'hidden') {
        // 페이지가 백그라운드로 가면 비디오 상태 저장
        userPausedRef.current = true;
      }
    };

    // 재생 시작 이벤트
    const handlePlay = () => {
      setIsPlaying(true);
      setVideoStarted(true);
    };

    // 일시정지 이벤트
    const handlePause = () => {
      setIsPlaying(false);
    };

    // 비디오 이벤트 리스너 등록
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handlePageVisibility);

    // 이벤트 해제
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handlePageVisibility);
    };
  }, [videoRef.current]);

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
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = v;
    
    // 볼륨 값이 0이면 음소거 활성화, 0이 아니면 음소거 해제
    const newMutedState = v === 0;
    
    // 음소거 상태가 변경되었을 때만 업데이트
    if (newMutedState !== isMuted) {
      video.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // 세션 스토리지에 사용자 음소거 설정 저장
      sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, newMutedState ? 'muted' : 'unmuted');
      
      if (onMutedChange) {
        onMutedChange(newMutedState);
      }
    }
  };
  
  // 음소거 토글 (사용자가 버튼을 클릭했을 때만 호출됨)
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    
    // 사용자가 명시적으로 볼륨 버튼을 클릭했을 때만 세션 스토리지에 저장
    sessionStorage.setItem(SESSION_USER_PREFERRED_MUTED_STATE, newMutedState ? 'muted' : 'unmuted');
    
    if (onMutedChange) {
      onMutedChange(newMutedState);
    }
  };
  
  // 볼륨 컨트롤 표시/숨김 처리
  const handleVolumeEnter = () => {
    setShowVolume(true);
  };
  
  const handleVolumeLeave = () => {
    // 볼륨 컨트롤 영역 밖으로 나갔을 때만 숨김
    setShowVolume(false);
  };
  
  // 마우스가 문서 클릭 시 볼륨 컨트롤 숨김
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        {/* 썸네일 이미지 (비디오 재생 전) */}
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

        {/* 재생 버튼 중앙 오버레이 */}
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

      {/* 컨트롤 영역 - 비디오 아래에 위치하도록 수정 */}
      <div className="bg-black text-white pt-2 pb-3 px-2">
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
            className="absolute bg-black border border-gray-700 shadow-lg z-20"
            style={{
              left: `${Math.min(Math.max(0, previewLeft - 80), progressBarRect.width - 160)}px`,
              bottom: `${progressBarRef.current ? progressBarRef.current.clientHeight + 40 : 60}px`,
              transform: "translateX(0)",
            }}
          >
            {getThumbnailAt && (
              <div className="w-40 h-24 relative overflow-hidden bg-black/80">
                {/* 썸네일 이미지 - 특정 부분만 보여주도록 수정 */}
                {previewTime !== null && getThumbnailAt(previewTime) && (
                  <div 
                    className="absolute"
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      backgroundImage: `url('${getThumbnailAt(previewTime)?.url || ''}')`,
                      backgroundPositionX: `-${getThumbnailAt(previewTime)?.x || 0}px`,
                      backgroundPositionY: `-${getThumbnailAt(previewTime)?.y || 0}px`,
                      backgroundRepeat: 'no-repeat',
                      transform: `scale(${160 / (getThumbnailAt(previewTime)?.width || 160)})`,
                      transformOrigin: 'top left'
                    }}
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
          onVolumeEnter={handleVolumeEnter}
          onVolumeLeave={handleVolumeLeave}
          onFullscreen={handleFullscreen}
          onTheaterMode={() => setTheaterMode(!theaterMode)}
          volumeControlRef={volumeControlRef as React.RefObject<HTMLDivElement>}
        />
      </div>
    </div>
  );
};
