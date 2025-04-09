import ky from 'ky';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3000';

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
              const newTokens = await ky.post(`${API_URL}/auth/token/access`, {
                json: { refreshToken },
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
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}; 