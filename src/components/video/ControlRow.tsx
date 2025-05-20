import React, { useState } from 'react';

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
}

export const ControlRow: React.FC<ControlRowProps> = ({
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
  onTheaterMode
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="controls-row flex flex-wrap items-center gap-3 text-yellow-300 z-35 bg-black rounded p-2 w-full min-w-0 mx-auto relative box-border" style={{ margin: 0 }}>
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
      <div className="relative">
        <button
          onClick={onMute}
          className="volume-btn text-2xl ml-2"
          onMouseEnter={() => {
            setHovered('volume');
            onVolumeEnter();
          }}
          onMouseLeave={() => {
            setHovered(null);
            onVolumeLeave();
          }}
        >
          {isMuted || volume === 0 ? '🔇' : '🔊'}
        </button>
        {hovered === 'volume' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            {isMuted ? '음소거 해제' : '음소거'}
          </span>
        )}
      </div>
      {showVolume && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={onVolumeChange}
          className="volume-slider ml-2"
          title="볼륨"
        />
      )}
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
