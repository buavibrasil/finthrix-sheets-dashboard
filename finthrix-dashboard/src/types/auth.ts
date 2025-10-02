export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ResetPasswordData {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  token?: string;
}

export interface EmailVerificationData {
  email: string;
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}