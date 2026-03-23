import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { EmailService } from '@/infrastructure/email/email.service';
import { QUEUE_NAMES } from '@/common/constants';
import PgBoss from 'pg-boss';

interface InviteEmailJob {
  type: 'invitation';
  to: string;
  role: string;
  token: string;
  inviteUrl: string;
  orgId: string;
  invitationId: string;
}

@Injectable()
export class SendInviteEmailWorker implements OnModuleInit {
  private readonly logger = new Logger(SendInviteEmailWorker.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queueService.subscribe<InviteEmailJob>(
      QUEUE_NAMES.SEND_INVITE_EMAIL,
      async (job: PgBoss.Job<InviteEmailJob>) => {
        await this.handleJob(job.data);
      },
    );
    this.logger.log('Send invite email worker subscribed');
  }

  private async handleJob(data: InviteEmailJob): Promise<void> {
    const emailContent = this.buildInviteEmail(data.to, data.role, data.inviteUrl);
    await this.emailService.send({
      to: data.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    this.logger.log(
      `Invitation email sent to ${data.to} for org (invitation: ${data.invitationId})`,
    );
  }

  private buildInviteEmail(
    email: string,
    role: string,
    inviteUrl: string,
  ): { subject: string; html: string } {
    return {
      subject: "You've been invited to join CRM-WA",
      html: `
        <h2>You're Invited!</h2>
        <p>You've been invited to join an organization on CRM-WA as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept your invitation and create your account:</p>
        <p><a href="${inviteUrl}" style="padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Accept Invitation</a></p>
        <p>This invitation expires in 48 hours.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
    };
  }
}
