export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface UserToken {
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  password?: string;
} 