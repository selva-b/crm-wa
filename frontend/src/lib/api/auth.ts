import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SessionInfo,
  MessageResponse,
} from "@/lib/types/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<MessageResponse>("/auth/register", data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient
      .post<MessageResponse>("/auth/verify-email", data)
      .then((r) => r.data),

  resendVerification: (data: ResendVerificationRequest) =>
    apiClient
      .post<MessageResponse>("/auth/resend-verification", data)
      .then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient
      .post<MessageResponse>("/auth/forgot-password", data)
      .then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient
      .post<MessageResponse>("/auth/reset-password", data)
      .then((r) => r.data),

  refreshToken: (data: RefreshTokenRequest) =>
    apiClient
      .post<RefreshTokenResponse>("/auth/refresh", data)
      .then((r) => r.data),

  logout: (data: RefreshTokenRequest) =>
    apiClient.post<MessageResponse>("/auth/logout", data).then((r) => r.data),

  getSessions: () =>
    apiClient.get<SessionInfo[]>("/auth/sessions").then((r) => r.data),

  revokeSession: (sessionId: string) =>
    apiClient
      .delete<MessageResponse>(`/auth/sessions/${sessionId}`)
      .then((r) => r.data),

  revokeAllSessions: () =>
    apiClient
      .delete<MessageResponse>("/auth/sessions")
      .then((r) => r.data),
};
