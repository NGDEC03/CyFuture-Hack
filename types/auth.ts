
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  token: string;
  data?: {
    userId?: string;
    email?: string;
    name?: string;
    token?: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  terms?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
  password?: string;
}

export interface ResendRequest {
  email: string;
}

export interface RequestProp {
  email: string;
}