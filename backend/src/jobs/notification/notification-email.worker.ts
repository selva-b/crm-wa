import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { EmailService } from '@/infrastructure/email/email.service';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { QUEUE_NAMES, NOTIFICATION_CONFIG } from '@/common/constants';
import { NotificationType, NotificationPriority } from '@prisma/client';
import PgBoss from 'pg-boss';

interface NotificationEmailJob {
  orgId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * EPIC 11 — Notification Email Worker
 *
 * Processes queued notification emails with:
 * - Template rendering per notification type
 * - Unsubscribe link in every email
 * - Retry via pg-boss (automatic exponential backoff)
 * - Concurrency control to prevent email provider throttling
 */
@Injectable()
export class NotificationEmailWorker implements OnModuleInit {
  private readonly logger = new Logger(NotificationEmailWorker.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly queueService: QueueService,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3000';
  }

  async onModuleInit(): Promise<void> {
    await this.queueService.subscribeConcurrent<NotificationEmailJob>(
      QUEUE_NAMES.SEND_NOTIFICATION_EMAIL,
      async (job: PgBoss.Job<NotificationEmailJob>) => {
        await this.handleJob(job.data);
      },
      NOTIFICATION_CONFIG.EMAIL_WORKER_CONCURRENCY,
    );
    this.logger.log('Notification email worker subscribed');
  }

  private async handleJob(data: NotificationEmailJob): Promise<void> {
    // 1. Load user to get email and name
    const user = await this.userRepository.findById(data.userId);
    if (!user || user.deletedAt) {
      this.logger.warn(
        `Skipping notification email: user ${data.userId} not found or deleted`,
      );
      return;
    }

    // 2. Build email content
    const { subject, html } = this.buildEmail(
      data.type,
      data.priority,
      data.title,
      data.body,
      user.firstName,
      data.data,
    );

    // 3. Send
    await this.emailService.send({
      to: user.email,
      subject,
      html,
    });

    this.logger.log(
      `Notification email sent to ${user.email}: type=${data.type}`,
    );
  }

  private buildEmail(
    type: NotificationType,
    priority: NotificationPriority,
    title: string,
    body: string,
    firstName: string,
    data?: Record<string, unknown>,
  ): { subject: string; html: string } {
    const priorityBadge = this.getPriorityBadge(priority);
    const unsubscribeUrl = `${this.frontendUrl}/settings/notifications`;

    const subject = `${priorityBadge}${title} — CRM-WA`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            ${priority === 'CRITICAL' ? '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;margin-bottom:16px;color:#991b1b;font-weight:600;">⚠ Critical Alert</div>' : ''}
            ${priority === 'HIGH' ? '<div style="background:#fffbeb;border:1px solid #fed7aa;border-radius:6px;padding:12px;margin-bottom:16px;color:#92400e;font-weight:600;">Important Notification</div>' : ''}

            <h2 style="margin:0 0 8px;color:#111;font-size:20px;">${title}</h2>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Hi ${firstName}, ${body}
            </p>

            ${this.buildActionButton(type, data)}

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              You're receiving this because you have email notifications enabled.
              <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  private getPriorityBadge(priority: NotificationPriority): string {
    switch (priority) {
      case 'CRITICAL':
        return '🚨 ';
      case 'HIGH':
        return '⚠️ ';
      default:
        return '';
    }
  }

  private buildActionButton(
    type: NotificationType,
    data?: Record<string, unknown>,
  ): string {
    const buttonStyle =
      'display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;';

    switch (type) {
      case 'MESSAGE_RECEIVED':
        return `<a href="${this.frontendUrl}/inbox/${data?.conversationId ?? ''}" style="${buttonStyle}">View Conversation</a>`;
      case 'CAMPAIGN_COMPLETED':
      case 'CAMPAIGN_FAILED':
        return `<a href="${this.frontendUrl}/campaigns/${data?.campaignId ?? ''}" style="${buttonStyle}">View Campaign</a>`;
      case 'PAYMENT_FAILED':
      case 'SUBSCRIPTION_EXPIRING':
        return `<a href="${this.frontendUrl}/settings/billing" style="${buttonStyle}">Manage Billing</a>`;
      case 'WHATSAPP_SESSION_DISCONNECTED':
        return `<a href="${this.frontendUrl}/settings/whatsapp" style="${buttonStyle}">Reconnect Session</a>`;
      case 'CONTACT_ASSIGNED':
      case 'CONTACT_REASSIGNED':
        return `<a href="${this.frontendUrl}/contacts/${data?.contactId ?? ''}" style="${buttonStyle}">View Contact</a>`;
      default:
        return `<a href="${this.frontendUrl}/notifications" style="${buttonStyle}">View Notifications</a>`;
    }
  }
}
