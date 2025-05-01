import React, { useState } from 'react';

interface ControlRowProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  showVolume: boolean;
  setShowVolume: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  formatTime: (seconds: number) => string;
  onFullscreen: () => void;
  fullscreen: boolean;
  onToggleTheaterMode: () => void;
  theaterMode: boolean;
}

export const ControlRow: React.FC<ControlRowProps> = ({
  isPlaying,
  onPlayPause,
  showVolume,
  setShowVolume,
  volume,
  onVolumeChange,
  currentTime,
  formatTime,
  onFullscreen,
  fullscreen,
  onToggleTheaterMode,
  theaterMode
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="controls-row flex flex-wrap items-center gap-3 text-yellow-300 z-20 bg-black rounded p-2 w-full min-w-0 mx-auto relative box-border" style={{ margin: 0 }}>
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
          onClick={() => setShowVolume(v => !v)}
          className="volume-btn text-2xl ml-2"
          onMouseEnter={() => setHovered('volume')}
          onMouseLeave={() => setHovered(null)}
        >
          {volume === 0 ? '🔇' : '🔊'}
        </button>
        {hovered === 'volume' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            볼륨
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
          {fullscreen ? '🡼' : '⛶'}
        </button>
        {hovered === 'fullscreen' && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-white z-50 pointer-events-none whitespace-nowrap">
            전체화면
          </span>
        )}
      </div>
      <div className="relative">
        <button
          onClick={onToggleTheaterMode}
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
