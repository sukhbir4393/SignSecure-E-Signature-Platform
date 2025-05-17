export interface AuthResponse {
  token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
} 