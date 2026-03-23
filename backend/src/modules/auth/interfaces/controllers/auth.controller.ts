import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Public, CurrentUser, JwtPayload, Roles } from '@/common/decorators';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from '../../application/dto';
import {
  RegisterUseCase,
  VerifyEmailUseCase,
  ResendVerificationUseCase,
  LoginUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  SessionManagementUseCase,
} from '../../application/use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly sessionManagementUseCase: SessionManagementUseCase,
  ) {}

  // ───────────────────────────────────────────
  // PUBLIC ENDPOINTS
  // ───────────────────────────────────────────

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.registerUseCase.execute(
      dto,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    return this.verifyEmailUseCase.execute(
      dto.token,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('resend-verification')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() dto: ResendVerificationDto,
    @Req() req: Request,
  ) {
    return this.resendVerificationUseCase.execute(
      dto.email,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.loginUseCase.execute(
      dto,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.forgotPasswordUseCase.execute(
      dto.email,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.resetPasswordUseCase.execute(
      dto.token,
      dto.newPassword,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.refreshTokenUseCase.execute(
      dto.refreshToken,
      this.getIp(req),
      this.getUa(req),
    );
  }

  // ───────────────────────────────────────────
  // AUTHENTICATED ENDPOINTS
  // ───────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.logoutUseCase.execute(
      dto.refreshToken,
      user.sub,
      user.orgId,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Get('sessions')
  async listSessions(@CurrentUser() user: JwtPayload) {
    return this.sessionManagementUseCase.listActiveSessions(
      user.sub,
      user.orgId,
    );
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.sessionManagementUseCase.revokeSession(
      sessionId,
      user.sub,
      user.orgId,
      user.role,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.sessionManagementUseCase.revokeAllSessions(
      user.sub,
      user.orgId,
      undefined,
      this.getIp(req),
      this.getUa(req),
    );
  }

  // Admin-only: revoke a session by ID (can be any user in the org)
  @Delete('admin/sessions/:sessionId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async adminRevokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.sessionManagementUseCase.revokeSession(
      sessionId,
      user.sub,
      user.orgId,
      user.role,
      this.getIp(req),
      this.getUa(req),
    );
  }

  // ───────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────

  private getIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private getUa(req: Request): string {
    return (req.headers['user-agent'] as string) || 'unknown';
  }
}
