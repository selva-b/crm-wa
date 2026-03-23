import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.pass');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port,
      secure: port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async send(payload: EmailPayload): Promise<void> {
    const from = this.configService.get<string>('email.from');
    try {
      await this.transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      this.logger.log(`Email sent to ${payload.to}: ${payload.subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${payload.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  buildVerificationEmail(
    firstName: string,
    verificationUrl: string,
  ): EmailPayload & { subject: string; html: string } {
    return {
      to: '',
      subject: 'Verify your email — CRM-WA',
      html: `
        <h2>Welcome to CRM-WA, ${firstName}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}" style="padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    };
  }

  buildPasswordResetEmail(
    firstName: string,
    resetUrl: string,
  ): { subject: string; html: string } {
    return {
      subject: 'Reset your password — CRM-WA',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName}, we received a request to reset your password.</p>
        <p><a href="${resetUrl}" style="padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    };
  }
}
