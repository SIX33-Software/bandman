export interface AuthUser {
  id: string;
  email: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: AuthUser;
  session: unknown;
}

export interface SignInResponse {
  user: AuthUser;
  access_token: string;
  session: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
