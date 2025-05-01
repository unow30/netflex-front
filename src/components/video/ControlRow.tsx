import React from 'react';

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
  fullscreen
}) => (
  <div className="controls-row flex items-center gap-3 text-yellow-300 z-20 bg-black/40 rounded p-2 w-full mx-auto" style={{ margin: 0 }}>
    <button onClick={onPlayPause} className="play-btn text-2xl">
      {isPlaying ? '⏸' : '▶'}
    </button>
    <button onClick={() => setShowVolume(v => !v)} className="text-2xl ml-2">
      {volume === 0 ? '🔇' : '🔊'}
    </button>
    {showVolume && (
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={onVolumeChange}
        className="volume-slider mx-2"
        style={{ width: 80 }}
      />
    )}
    {showVolume && (
      <span className="volume-label text-xs w-8">{Math.round(volume * 100)}</span>
    )}
    <div className="time-display min-w-[48px] text-right ml-2">{formatTime(currentTime)}</div>
    <div className="flex-1" />
    <button onClick={onFullscreen} className="fullscreen-btn text-2xl ml-2">
      {fullscreen ? '🡼' : '⛶'}
    </button>
  </div>
);
