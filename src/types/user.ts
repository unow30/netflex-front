export enum Role {
  admin,
  paidUser,
  user,
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