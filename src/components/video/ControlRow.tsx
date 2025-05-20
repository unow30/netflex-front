import React, { useState, useRef, useEffect } from 'react';

interface ControlRowProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  showVolume: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  currentTime: number;
  formatTime: (seconds: number) => string;
  onPlayPause: () => void;
  onMute: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeEnter: () => void;
  onVolumeLeave: () => void;
  onFullscreen: () => void;
  onTheaterMode: () => void;
  volumeControlRef?: React.RefObject<HTMLDivElement>;
}

const ControlRow: React.FC<ControlRowProps> = ({
  isPlaying,
  isMuted,
  volume,
  showVolume,
  isFullscreen,
  isTheaterMode,
  currentTime,
  formatTime,
  onPlayPause,
  onMute,
  onVolumeChange,
  onVolumeEnter,
  onVolumeLeave,
  onFullscreen,
  onTheaterMode,
  volumeControlRef,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);

  // 볼륨 조절바 표시 상태 관리 
  const handleMouseEnterControls = () => {
    setIsVolumeVisible(true);
    onVolumeEnter(); // 기존 콜백도 호출 
  };

  const handleMouseLeaveControls = () => {
    setIsVolumeVisible(false);
    onVolumeLeave(); // 기존 콜백도 호출
  };

  return (
    <div 
      className="controls-row flex flex-wrap items-center gap-3 text-yellow-300 z-35 bg-black rounded p-2 w-full min-w-0 mx-auto relative box-border" 
      style={{ margin: 0 }}
      ref={controlsRef}
      onMouseEnter={handleMouseEnterControls}
      onMouseLeave={handleMouseLeaveControls}
    >
      <div className="relative">
        <button
          onClick={onPlayPause}
          className="play-btn text-2xl"
          onMouseEnter={() => setHovered('play')}
          onMouseLeave={() => setHovered(null)}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        {hovered === 'play' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            {isPlaying ? '일시정지' : '재생'}
          </span>
        )}
      </div>
      {/* 유튜브 스타일 볼륨 컨트롤 */}
      <div
        className="relative flex items-center group"
        style={{ width: '32px', height: '32px' }}
        ref={volumeControlRef}
      >
        <button
          onClick={onMute}
          className="volume-btn text-2xl flex items-center justify-center w-8 h-8"
          style={{ outline: 'none', background: 'transparent', border: 'none', padding: 0 }}
        >
          {isMuted || volume === 0 ? '🔇' : '🔊'}
        </button>
        {/* 사운드바: 컨트롤 영역(빨간 박스)에 마우스가 있을 때 표시 */}
        {(isVolumeVisible || showVolume) && (
          <div
            className="absolute left-9 top-1/2 -translate-y-1/2 flex items-center px-2 py-1 bg-black/80 rounded z-40"
            style={{ minWidth: '96px', width: '96px', height: '32px' }}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolumeChange}
              className="volume-slider"
              style={{ width: '88px', accentColor: '#fff' }}
              title="볼륨"
            />
          </div>
        )}
      </div>
      <span className="ml-2 text-sm">
        {formatTime(currentTime)}
      </span>
      <div className="flex-1" />
      <div className="relative">
        <button
          onClick={onFullscreen}
          className="fullscreen-btn text-2xl ml-2"
          onMouseEnter={() => setHovered('fullscreen')}
          onMouseLeave={() => setHovered(null)}
        >
          ⛶
        </button>
        {hovered === 'fullscreen' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            {isFullscreen ? '전체화면 나가기' : '전체화면'}
          </span>
        )}
      </div>
      <div className="relative">
        <button
          onClick={onTheaterMode}
          className="theater-btn text-2xl ml-2"
          onMouseEnter={() => setHovered('theater')}
          onMouseLeave={() => setHovered(null)}
        >
          {'📺'}
        </button>
        {hovered === 'theater' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            영화관 모드
          </span>
        )}
      </div>
    </div>
  );
};

export default ControlRow;
