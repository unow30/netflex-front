import { CreateUserDto, User, UserToken } from '../types';
import { ApiResponse, api, createBasicAuthHeader, extractData } from './api';

export const authService = {
  async register(userData: CreateUserDto): Promise<User> {
    const response = await api.post('auth/register', {
      headers: {
        Authorization: createBasicAuthHeader(userData.email, userData.password)
      }
    }).json<ApiResponse<User>>();
    
    return extractData(response);
  },

  async login(email: string, password: string): Promise<UserToken> {
    const response = await api.post('auth/login', {
      headers: {
        Authorization: createBasicAuthHeader(email, password)
      }
    }).json<ApiResponse<UserToken>>();
    
    const result = extractData(response);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    
    return result;
  },

  async getMe(): Promise<User> {
    const response = await api.get('auth/me').json<ApiResponse<User>>();
    return extractData(response);
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post('auth/token/access', {
      json: { refreshToken }
    }).json<ApiResponse<{ accessToken: string }>>();
    
    return extractData(response);
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}; 