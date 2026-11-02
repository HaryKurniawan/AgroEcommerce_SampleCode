import { User, UserRole } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
