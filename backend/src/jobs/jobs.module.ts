import { Module } from '@nestjs/common';
import { SendEmailWorker } from './email/send-email.worker';
import { SendInviteEmailWorker } from './invitation/send-invite-email.worker';
import { SessionCleanupWorker } from './auth/session-cleanup.worker';
import { SessionRepository } from '@/modules/auth/infrastructure/repositories/session.repository';
import { SendMessageWorker } from './whatsapp/send-message.worker';
import { SessionHealthWorker } from './whatsapp/session-health.worker';
import { IncomingMessageWorker } from './messaging/incoming-message.worker';
import { MessageRecoveryWorker } from './messaging/message-recovery.worker';
import { WhatsAppModule } from '@/modules/whatsapp/whatsapp.module';
import { MessagesModule } from '@/modules/messages/messages.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { CampaignsModule } from '@/modules/campaigns/campaigns.module';
import { AutomationModule } from '@/modules/automation/automation.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { ObservabilityModule } from '@/modules/observability/observability.module';
import { BillingModule } from '@/modules/billing/billing.module';
// EPIC 6 — Campaign workers
import { CampaignExecutorWorker } from './campaign/campaign-executor.worker';
import { CampaignBatchWorker } from './campaign/campaign-batch.worker';
import { CampaignSchedulerWorker } from './campaign/campaign-scheduler.worker';
// EPIC 7 — Scheduling & Automation workers
import { AutomationEvaluatorWorker } from './automation/automation-evaluator.worker';
import { FollowUpWorker } from './automation/follow-up.worker';
import { ScheduledMessageWorker } from './scheduler/scheduled-message.worker';
// EPIC 9 — Billing & Subscription workers
import { BillingCycleWorker } from './billing/billing-cycle.worker';
import { PaymentRetryWorker } from './billing/payment-retry.worker';
// EPIC 10 — Observability workers
import { MetricCleanupWorker } from './observability/metric-cleanup.worker';
import { QueueMetricsWorker } from './observability/queue-metrics.worker';
// EPIC 11 — Notification workers
import { NotificationEmailWorker } from './notification/notification-email.worker';
// EPIC 12 — Settings & Configuration workers
import { WebhookDeliveryWorker } from './webhook/webhook-delivery.worker';
import { UsersModule } from '@/modules/users/users.module';
import { SettingsModule } from '@/modules/settings/settings.module';

@Module({
  imports: [
    WhatsAppModule,
    MessagesModule,
    AuditModule,
    CampaignsModule,
    AutomationModule,
    SchedulerModule,
    ObservabilityModule,
    BillingModule,
    UsersModule,
    SettingsModule,
  ],
  providers: [
    SendEmailWorker,
    SendInviteEmailWorker,
    SessionCleanupWorker,
    SessionRepository,
    // WhatsApp workers
    SendMessageWorker,
    SessionHealthWorker,
    // EPIC 5 — Messaging Engine workers
    IncomingMessageWorker,
    MessageRecoveryWorker,
    // EPIC 6 — Campaign Management workers
    CampaignExecutorWorker,
    CampaignBatchWorker,
    CampaignSchedulerWorker,
    // EPIC 7 — Scheduling & Automation workers
    AutomationEvaluatorWorker,
    FollowUpWorker,
    ScheduledMessageWorker,
    // EPIC 9 — Billing & Subscription workers
    BillingCycleWorker,
    PaymentRetryWorker,
    // EPIC 10 — Observability workers
    MetricCleanupWorker,
    QueueMetricsWorker,
    // EPIC 11 — Notification workers
    NotificationEmailWorker,
    // EPIC 12 — Settings & Configuration workers
    WebhookDeliveryWorker,
  ],
})
export class JobsModule {}
