# Netflex Frontend (Webpack)

NetFlex는 영화 정보, 장르 정보, 감독 정보를 제공하는 스트리밍 서비스의 프론트엔드 애플리케이션입니다.

## 기능

- 사용자 인증 (로그인, 회원가입)
- 영화 목록 조회
- 영화 상세 정보 조회 및 재생
- 영화 좋아요 기능
- 감독 및 장르 정보 조회
- 다크 모드 지원

## 기술 스택

- React 19
- TypeScript
- React Router 7.5
- Tailwind CSS
- Webpack 5

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

# 개발 서버 실행
pnpm dev
```

서버는 기본적으로 http://localhost:3010 에서 실행됩니다.

## 프로젝트 구조

```
src/
  ├── app/           # 페이지 컴포넌트
  ├── components/    # 재사용 가능한 컴포넌트
  ├── hooks/         # 커스텀 훅
  ├── services/      # API 서비스
  ├── types/         # 타입 정의
  ├── App.tsx        # 메인 App 컴포넌트
  └── main.tsx       # 앱 진입점
```

## 빌드 설정

- Webpack을 사용한 빌드 설정
- Babel을 사용한 JavaScript/TypeScript 트랜스파일
- PostCSS와 Tailwind CSS 설정
- 개발 서버 프록시 설정 (API 요청을 백엔드로 포워딩)

## API 연결

이 프론트엔드는 `http://localhost:3000`에서 실행되는 백엔드 API에 연결됩니다. API 엔드포인트는 `/api` 경로를 통해 접근합니다.

## 인증

- 로그인 및 회원가입 요청에는 Basic Auth 인증 방식을 사용합니다.
- 다른 모든 요청에는 Bearer Token 인증 방식을 사용합니다.
- 토큰은 localStorage에 저장되며, 토큰 갱신 기능을 지원합니다.
