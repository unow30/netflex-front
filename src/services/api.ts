import ky from 'ky';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NODE_ENV === 'production' ? 'https://api.ceramic-tager.store' : 'http://localhost:3000';

export interface ApiResponse<T> {
  status: number;
  url: string;
  data: T;
}

export const extractData = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

export const api = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      request => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          // 액세스 토큰이 만료된 경우, 리프레시 토큰으로 갱신 시도
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              // 서버 문서에 맞게 수정: Authorization 헤더에 리프레시 토큰 전송
              const newTokens = await ky.post(`${API_URL}/auth/token/access`, {
                headers: {
                  Authorization: `Bearer ${refreshToken}`
                }
              }).json<ApiResponse<{ accessToken: string }>>();
              
              localStorage.setItem('accessToken', newTokens.data.accessToken);
              
              // 원래 요청 재시도
              request.headers.set('Authorization', `Bearer ${newTokens.data.accessToken}`);
              return ky(request);
            } catch (error) {
              // 리프레시 토큰도 만료된 경우 로그아웃
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          }
        }
        return response;
      }
    ]
  }
});

export const createBasicAuthHeader = (email: string, password: string): string => {
  return `Basic ${btoa(`${email}:${password}`)}`;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number; type?: string } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// 액세스/리프레시 토큰 상태 확인을 위한 유틸리티 함수
export const checkTokensStatus = (): void => {
  console.log('===== 토큰 상태 확인 =====');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken) {
    console.log('ACCESS TOKEN 존재함');
    const decoded: any = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    const remainingSeconds = Math.round(decoded.exp - currentTime);
    console.log(`${decoded.type?.toUpperCase() || 'ACCESS'} 토큰 만료 여부:`, isExpired, `만료까지 남은 시간: ${remainingSeconds}초`);
  } else {
    console.log('ACCESS TOKEN 없음');
  }
  
  if (refreshToken) {
    console.log('REFRESH TOKEN 존재함');
    const decoded: any = jwtDecode(refreshToken);
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    const remainingSeconds = Math.round(decoded.exp - currentTime);
    console.log(`${decoded.type?.toUpperCase() || 'REFRESH'} 토큰 만료 여부:`, isExpired, `만료까지 남은 시간: ${remainingSeconds}초`);
  } else {
    console.log('REFRESH TOKEN 없음');
  }
  console.log('========================');
};

// 토큰 디코딩하여 내부 정보 확인하는 유틸리티 함수
export const decodeToken = (token: string): any => {
  try {
    const decoded = jwtDecode(token);
    console.log('토큰 디코딩 결과:', decoded);
    return decoded;
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
    return null;
  }
};