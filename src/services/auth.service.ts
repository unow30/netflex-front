import { CreateUserDto, User, UserToken } from '../types';
import { api, createBasicAuthHeader } from './api';

export const authService = {
  async register(userData: CreateUserDto): Promise<User> {
    return await api.post<User>('auth/register', undefined, {
      headers: {
        Authorization: createBasicAuthHeader(userData.email, userData.password)
      }
    });
  },

  async login(email: string, password: string): Promise<UserToken> {
    const result = await api.post<UserToken>('auth/login', undefined, {
      headers: {
        Authorization: createBasicAuthHeader(email, password)
      }
    });
    
    // 토큰 로컬 스토리지에 저장
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    
    return result;
  },

  async getMe(): Promise<User> {
    return await api.get<User>('auth/me');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return await api.post<{ accessToken: string }>('auth/token/access', { refreshToken });
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};