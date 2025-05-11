# 비디오 플레이어 문서

## 개요

Netflex 비디오 플레이어는 HLS(HTTP Live Streaming) 프로토콜을 사용하여 고품질 스트리밍 경험을 제공합니다. 이 플레이어는 여러 컴포넌트로 구성되어 있으며, 각 컴포넌트는 특정 기능을 담당합니다.

## 주요 컴포넌트

### HLSVideoPlayer

`HLSVideoPlayer` 컴포넌트는 HLS 스트리밍을 처리하는 핵심 플레이어 컴포넌트입니다.

```tsx
// 사용 예시
<HLSVideoPlayer 
  src="https://example.com/video.m3u8" 
  autoPlay={true}
  onTimeUpdate={handleTimeUpdate}
/>
```

#### 주요 속성
- `src`: HLS 스트림 URL (.m3u8 파일)
- `autoPlay`: 자동 재생 여부
- `onTimeUpdate`: 시간 업데이트 핸들러

### VideoThumbnailPreview

`VideoThumbnailPreview` 컴포넌트는 사용자가 진행 막대 위에 마우스를 올렸을 때 미리보기 썸네일을 표시합니다.

```tsx
// 사용 예시
<VideoThumbnailPreview 
  vttUrl="https://example.com/thumbnails.vtt"
  currentTime={hoverTime}
  duration={videoDuration}
/>
```

#### 주요 속성
- `vttUrl`: 썸네일 정보가 포함된 VTT 파일 URL
- `currentTime`: 현재 미리보기 시간 (초)
- `duration`: 비디오 총 길이 (초)

### ProgressBar

`ProgressBar` 컴포넌트는 비디오의 현재 진행 상태와 버퍼링 상태를 표시합니다.

```tsx
// 사용 예시
<ProgressBar 
  currentTime={currentTime}
  duration={duration}
  buffered={buffered}
  onSeek={handleSeek}
  onHover={handleHover}
/>
```

#### 주요 속성
- `currentTime`: 현재 재생 시간 (초)
- `duration`: 비디오 총 길이 (초)
- `buffered`: 버퍼링된 시간 범위 (TimeRanges 객체)
- `onSeek`: 탐색 핸들러
- `onHover`: 호버 핸들러

### ControlRow

`ControlRow` 컴포넌트는 재생/일시정지, 볼륨, 전체화면 등의 컨트롤을 제공합니다.

```tsx
// 사용 예시
<ControlRow 
  isPlaying={isPlaying}
  volume={volume}
  isMuted={isMuted}
  onPlayPause={handlePlayPause}
  onVolumeChange={handleVolumeChange}
  onMuteToggle={handleMuteToggle}
  onFullscreenToggle={handleFullscreenToggle}
/>
```

#### 주요 속성
- `isPlaying`: 재생 중 여부
- `volume`: 볼륨 레벨 (0-1)
- `isMuted`: 음소거 여부
- `onPlayPause`: 재생/일시정지 토글 핸들러
- `onVolumeChange`: 볼륨 변경 핸들러
- `onMuteToggle`: 음소거 토글 핸들러
- `onFullscreenToggle`: 전체화면 토글 핸들러

## VTT 파일 형식

비디오 썸네일 미리보기는 WebVTT 파일을 사용합니다. 이 파일의 구조는 다음과 같습니다:

```
WEBVTT

00:00:00.000 --> 00:00:05.000
thumbnails/thumbnail-1.jpg#xywh=0,0,160,90

00:00:05.000 --> 00:00:10.000
thumbnails/thumbnail-2.jpg#xywh=0,0,160,90

...
```

각 항목에서:
- 시간 범위는 해당 썸네일이 표시되는 비디오 구간을 나타냅니다
- URL은 썸네일 이미지 경로를 지정합니다
- `#xywh` 매개변수는 스프라이트 이미지에서 추출할 영역을 지정합니다 (x좌표, y좌표, 너비, 높이)

## 커스텀 훅

### useHLSPlayer

HLS 플레이어를 쉽게 구현할 수 있는 커스텀 훅입니다.

```tsx
const {
  videoRef,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  play,
  pause,
  seek,
  setVolume,
  toggleMute,
  enterFullscreen
} = useHLSPlayer({ src: 'https://example.com/video.m3u8' });
```

#### 주요 기능
- HLS.js 인스턴스 관리
- 비디오 상태 관리
- 재생 제어 함수 제공
- 썸네일 VTT 파일 파싱

## 확장 및 커스터마이징

비디오 플레이어는 다양한 방식으로 커스터마이징할 수 있습니다:

1. 테마 변경: Tailwind CSS 클래스를 사용하여 외관 변경
2. 추가 컨트롤: 배속 조절, 자막 등의 추가 컨트롤 구현
3. 이벤트 핸들러: 다양한 이벤트에 대한 사용자 지정 핸들러 추가

## 예제 코드

전체 비디오 플레이어 구현 예시:

```tsx
import React, { useState } from 'react';
import HLSVideoPlayer from './HLSVideoPlayer';
import ControlRow from './ControlRow';
import ProgressBar from './ProgressBar';
import VideoThumbnailPreview from './VideoThumbnailPreview';
import { useHLSPlayer } from '../../hooks/useHLSPlayer';

const VideoPlayer = ({ src, thumbnailVtt }) => {
  const [hoverTime, setHoverTime] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);
  
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    enterFullscreen
  } = useHLSPlayer({ src });
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const handleSeek = (time) => {
    seek(time);
  };
  
  const handleHover = (time, show) => {
    setHoverTime(time);
    setShowThumbnail(show);
  };
  
  return (
    <div className="relative w-full">
      <HLSVideoPlayer ref={videoRef} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
        {showThumbnail && (
          <VideoThumbnailPreview 
            vttUrl={thumbnailVtt}
            currentTime={hoverTime}
            duration={duration}
          />
        )}
        
        <ProgressBar 
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={handleSeek}
          onHover={handleHover}
        />
        
        <ControlRow 
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={handlePlayPause}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
          onFullscreenToggle={enterFullscreen}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
```

## 문제 해결

### 일반적인 문제

1. **HLS 스트림 로드 실패**
   - CORS 설정 확인
   - 스트림 URL 유효성 검사
   - 네트워크 연결 상태 확인

2. **썸네일 미리보기 표시 안 됨**
   - VTT 파일 형식 확인
   - 이미지 경로 유효성 검사
   - 크로스 오리진 이미지 정책 확인

3. **성능 문제**
   - 낮은 품질의 스트림으로 시작하고 점진적으로 품질 향상
   - 비디오 이벤트 핸들러 최적화
   - 불필요한 리렌더링 방지
