export interface LoginRequest {
  userName: string;
  password: string;
  clientId: string;
  grant_type: string;
  clientSecret: string;
  rememberMe: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  issued: string;
  isAdmin: boolean;
}

export interface RefreshTokenRequest {
  clientId: string;
  refreshToken: string;
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: any;
}

export interface AuthenticatedUser extends User {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  issued: string;
  isAdmin: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ENGINEER = 'engineer'
}