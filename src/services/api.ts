import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NODE_ENV === 'production' ? 'https://api.ceramic-tager.store' : 'http://localhost:3000';

// API 응답 타입 정의
export interface ApiResponse<T> {
  status: number;
  url: string;
  data: T;
}

export const extractData = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

// 기본 fetch 옵션 정의
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'same-origin',
};

// API 요청을 위한 확장된 옵션 타입 (searchParams 지원)
export interface ExtendedRequestInit extends RequestInit {
  searchParams?: Record<string, string> | URLSearchParams;
}

// API 인터페이스 정의
export const api = {
  // GET 요청
  async get<T>(endpoint: string, options: ExtendedRequestInit = {}): Promise<T> {
    return await makeRequest<T>('GET', endpoint, options);
  },

  // POST 요청
  async post<T>(endpoint: string, data?: any, options: ExtendedRequestInit = {}): Promise<T> {
    return await makeRequest<T>('POST', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT 요청
  async put<T>(endpoint: string, data?: any, options: ExtendedRequestInit = {}): Promise<T> {
    return await makeRequest<T>('PUT', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PATCH 요청
  async patch<T>(endpoint: string, data?: any, options: ExtendedRequestInit = {}): Promise<T> {
    return await makeRequest<T>('PATCH', endpoint, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE 요청
  async delete<T>(endpoint: string, options: ExtendedRequestInit = {}): Promise<T> {
    return await makeRequest<T>('DELETE', endpoint, options);
  },
};

// 기본 요청 함수 (내부 구현)
async function makeRequest<T>(method: string, endpoint: string, options: ExtendedRequestInit = {}): Promise<T> {
  // 요청 URL 생성 (searchParams 처리)
  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}/${endpoint}`;
  
  // searchParams 처리
  if (options.searchParams) {
    const searchParams = new URLSearchParams(options.searchParams as any);
    url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    delete options.searchParams; // 표준 RequestInit에는 없는 속성이므로 제거
  }
  
  // 기본 옵션과 사용자 옵션 병합
  const requestOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    method,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    }
  };
  
  // 토큰이 있으면 인증 헤더 추가
  const token = localStorage.getItem('accessToken');
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  try {
    // fetch 요청 보내기
    let response = await fetch(url, requestOptions);

    // 401 에러 처리 (액세스 토큰 만료)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // 액세스 토큰 갱신 요청
          const refreshResponse = await fetch(`${API_URL}/auth/token/access`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });
          
          if (!refreshResponse.ok) {
            throw new Error('리프레시 토큰으로 인증 실패');
          }
          
          const responseData = await refreshResponse.json();
          const newTokens = responseData as ApiResponse<{ accessToken: string }>;
          localStorage.setItem('accessToken', newTokens.data.accessToken);
          
          // 원래 요청 다시 시도
          requestOptions.headers = {
            ...requestOptions.headers,
            'Authorization': `Bearer ${newTokens.data.accessToken}`
          };
          
          // 원래 요청 재시도
          response = await fetch(url, requestOptions);
        } catch (error) {
          // 리프레시 토큰도 만료된 경우 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw error;
        }
      }
    }

    // 응답 확인
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    // 응답 처리
    let responseData;
    if (response.headers.get('content-type')?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // API 응답이 이미 우리 형식에 맞는지 확인
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data as T;
    }
    
    // 아니라면 우리 형식으로 변환
    return responseData as T;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
}

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