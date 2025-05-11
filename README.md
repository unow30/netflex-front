# Netflex Frontend

NetFlex2는 영화 정보, 장르 정보, 감독 정보를 제공하는 스트리밍 서비스의 프론트엔드 애플리케이션입니다.

## 기술 문서 바로가기
- [1. HLS(HTTP Live Streaming) 프로토콜.md](docs/1.%20HLS%28HTTP%20Live%20Streaming%29%20%ED%94%84%EB%A1%9C%ED%86%A0%EC%BD%9C.md)
- [2. aws media convert를 이용한 영상파일 변환 로직.md](docs/2.%20aws%20media%20convert%EB%A5%BC%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20%EC%98%81%EC%83%81%ED%8C%8C%EC%9D%BC%20%EB%B3%80%ED%99%98%20%EB%A1%9C%EC%A7%81.md)
- [3. HLS player 구현.md](docs/3.%20HLS%20player%20%EA%B5%AC%ED%98%84.md)
- [4. 썸네일 미리보기 기능 구현과정.md](docs/4.%20%EC%8D%B8%EB%84%A4%EC%9D%BC%20%EB%AF%B8%EB%A6%AC%EB%B3%B4%EA%B8%B0%20%EA%B8%B0%EB%8A%A5%20%EA%B5%AC%ED%98%84%EA%B3%BC%EC%A0%95.md)

## 기능

- 사용자 인증 (로그인, 회원가입)
- 영화 목록 조회 및 검색
- 영화 상세 정보 조회 및 재생
- 감독 및 장르 정보 조회
- 다크 모드 지원
- 반응형 디자인으로 모바일 환경 지원

## 기술 스택

- **프론트엔드 프레임워크**: React 19
- **언어**: TypeScript
- **라우팅**: React Router 7.5
- **스타일링**: Tailwind CSS 3.3
- **API 통신**: ky 1.8
- **미디어 재생**: hls.js 1.6
- **개발 환경**: Webpack 5, Babel
- **테스트**: Jest, React Testing Library

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- pnpm 패키지 매니저

### 설치 방법

```bash
# 저장소 클론
git clone <repository-url>
cd netflex-front

# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 개발 모드로 실행
pnpm start:dev

# 프로덕션 모드로 실행
pnpm start
```
### 빌드

```bash
# 프로덕션용 빌드
pnpm build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

## 프로젝트 구조

```
netflex-front/
  ├── public/              # 정적 파일
  ├── src/                 # 소스 코드
  │   ├── app/             # 페이지 컴포넌트
  │   ├── assets/          # 이미지, 폰트 등 자산 파일
  │   ├── components/      # 재사용 가능한 UI 컴포넌트
  │   ├── hooks/           # 커스텀 React 훅
  │   ├── services/        # API 서비스 및 통신 로직
  │   ├── types/           # TypeScript 타입 정의
  │   ├── utils/           # 유틸리티 함수
  │   ├── App.css          # 앱 전역 스타일
  │   ├── App.tsx          # 메인 App 컴포넌트
  │   ├── index.css        # 전역 CSS
  │   └── main.tsx         # 앱 진입점
  ├── .babelrc             # Babel 설정
  ├── .gitignore           # Git 무시 파일 목록
  ├── eslint.config.js     # ESLint 설정
  ├── index.html           # HTML 템플릿
  ├── package.json         # 프로젝트 의존성 및 스크립트
  ├── postcss.config.js    # PostCSS 설정
  ├── tailwind.config.js   # Tailwind CSS 설정
  ├── tsconfig.json        # TypeScript 설정
  └── webpack.config.js    # Webpack 설정
```

### 주요 디렉토리 설명

- **app/**: 페이지 컴포넌트와 라우트 정의가 포함되어 있습니다.
- **components/**: 버튼, 카드, 모달 등 재사용 가능한 UI 컴포넌트가 있습니다.
- **hooks/**: 커스텀 React 훅이 정의되어 있습니다.
- **services/**: API 통신과 관련된 서비스 함수들이 있습니다.
- **types/**: 프로젝트 전반에서 사용되는 TypeScript 타입 정의가 있습니다.
- **utils/**: 유틸리티 함수들이 포함되어 있습니다.

## 주요 스크립트

- `pnpm start`: 프로덕션 모드로 애플리케이션 실행
- `pnpm start:dev`: 개발 모드로 애플리케이션 실행 (핫 리로딩 지원)
- `pnpm build`: 프로덕션용 빌드 생성
- `pnpm test`: 테스트 실행

## API 연결

이 프론트엔드는 `https://api.ceramic-tager.store`에서 실행되는 백엔드 API에 연결됩니다. 

### API 구조

- `/auth`: 인증 관련 엔드포인트 (로그인, 회원가입, 토큰 갱신)
- `/movies`: 영화 정보 관련 엔드포인트
- `/genres`: 장르 정보 관련 엔드포인트
- `/directors`: 감독 정보 관련 엔드포인트
- `/user`: 사용자 정보 및 설정 관련 엔드포인트

## 인증

- 로그인 및 회원가입 요청에는 Basic Auth 인증 방식을 사용합니다.
- 다른 모든 요청에는 Bearer Token 인증 방식을 사용합니다.
- 토큰은 localStorage에 저장되며, 토큰 갱신 기능을 지원합니다.
- 인증 관련 로직은 `src/services/auth.ts`에 정의되어 있습니다.

## 상태 관리

- React의 내장 기능인 Context API를 사용하여 상태를 관리합니다.
- 주요 상태 컨텍스트:
  - AuthContext: 사용자 인증 상태 관리
  - ThemeContext: 다크 모드/라이트 모드 테마 관리
  - PlayerContext: 비디오 플레이어 상태 관리

## UI/UX 특징

- Tailwind CSS를 활용한 모던하고 반응형 디자인
- 다크 모드 지원으로 사용자 선호도에 맞는 UI 제공
- 애니메이션과 트랜지션을 통한 부드러운 사용자 경험

## 반응형 디자인

- 모바일, 태블릿, 데스크탑 등 다양한 화면 크기에 최적화
- Tailwind의 브레이크포인트를 활용한 반응형 레이아웃

## 프로젝트 문서

프로젝트의 상세 문서는 `docs/` 디렉토리에 마크다운 파일로 정리되어 있습니다. 주요 문서는 다음과 같습니다:

- **비디오 플레이어**: [비디오 플레이어 문서](./docs/video-player.md) - 비디오 플레이어 컴포넌트와 관련 기능에 대한 상세 설명

GitHub에서 볼 때 문서 파일들은 마크다운 형식으로 표시됩니다. 문서에 사용되는 이미지나 기타 자산은 `docs/assets/` 폴더에 저장됩니다.

마크다운 파일에서 이미지를 참조할 때는 다음과 같이 사용합니다:
```markdown
![예시 이미지](./docs/assets/example-image.png)
```

## 배포

프로젝트는 다음과 같은 방법으로 배포할 수 있습니다:

1. 정적 호스팅 서비스 (Netlify, Vercel 등)
2. Docker 컨테이너를 통한 배포
3. 클라우드 서비스 (AWS, GCP 등)

## 기여하기

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이센스

[MIT](LICENSE) 라이센스 하에 배포됩니다.
