// 기본 API 유틸리티만 내보내기
export * from './api';

// 다른 서비스는 기본적으로 내보내지 않고, 필요할 때 동적으로 로드하도록 합니다.
// 각 페이지나 컴포넌트에서 다음과 같이 사용:
// const { movieService } = await import('../services/movie.service');
 