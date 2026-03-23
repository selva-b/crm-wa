import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { CampaignRepository } from '@/modules/campaigns/infrastructure/repositories/campaign.repository';
import { AuditService } from '@/modules/audit/domain/services/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  QUEUE_NAMES,
  EVENT_NAMES,
  CAMPAIGN_CONFIG,
} from '@/common/constants';
import { AuditAction, CampaignStatus } from '@prisma/client';

/**
 * CampaignSchedulerWorker
 *
 * Periodically checks for scheduled campaigns that are due for execution.
 * Acts as a safety net alongside pg-boss delayed jobs — if the delayed job
 * fires correctly, the scheduler finds no matching campaigns. If the delayed
 * job is lost (e.g., due to restart), the scheduler picks it up.
 *
 * Uses pg-boss `schedule()` for cron-like periodic execution.
 */
@Injectable()
export class CampaignSchedulerWorker implements OnModuleInit {
  private readonly logger = new Logger(CampaignSchedulerWorker.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly campaignRepo: CampaignRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to the schedule-check queue
    await this.queueService.subscribe<Record<string, never>>(
      QUEUE_NAMES.CAMPAIGN_SCHEDULE_CHECK,
      async () => this.checkScheduledCampaigns(),
    );

    // Schedule periodic check using pg-boss cron
    const boss = this.queueService.getBoss();
    const cronExpression = `*/${CAMPAIGN_CONFIG.SCHEDULE_CHECK_INTERVAL_SECONDS} * * * *`;

    // pg-boss schedule() uses cron syntax (minimum resolution: 1 minute)
    // For sub-minute intervals, use a self-re-queuing pattern
    await this.scheduleNextCheck();

    this.logger.log(
      `CampaignSchedulerWorker started (interval=${CAMPAIGN_CONFIG.SCHEDULE_CHECK_INTERVAL_SECONDS}s)`,
    );
  }

  private async scheduleNextCheck(): Promise<void> {
    await this.queueService.publishDelayed(
      QUEUE_NAMES.CAMPAIGN_SCHEDULE_CHECK,
      {},
      CAMPAIGN_CONFIG.SCHEDULE_CHECK_INTERVAL_SECONDS,
      { singletonKey: 'campaign-schedule-check' },
    );
  }

  private async checkScheduledCampaigns(): Promise<void> {
    try {
      const now = new Date();
      const campaigns = await this.campaignRepo.findScheduledCampaigns(now);

      if (campaigns.length === 0) {
        // Re-schedule next check
        await this.scheduleNextCheck();
        return;
      }

      this.logger.log(`Found ${campaigns.length} scheduled campaign(s) due for execution`);

      for (const campaign of campaigns) {
        try {
          // Atomically transition SCHEDULED → RUNNING
          const transitioned = await this.campaignRepo.transitionStatus(
            campaign.id,
            CampaignStatus.SCHEDULED,
            CampaignStatus.RUNNING,
            { startedAt: new Date() },
          );

          if (!transitioned) {
            // Already transitioned by the delayed job
            this.logger.log(`Campaign ${campaign.id} already transitioned from SCHEDULED`);
            continue;
          }

          // Record event
          await this.campaignRepo.recordEvent({
            campaignId: campaign.id,
            orgId: campaign.orgId,
            previousStatus: CampaignStatus.SCHEDULED,
            newStatus: CampaignStatus.RUNNING,
            metadata: { triggeredBy: 'scheduler-check' },
          });

          // Publish execution job
          await this.queueService.publishOnce(
            QUEUE_NAMES.CAMPAIGN_EXECUTE,
            {
              campaignId: campaign.id,
              orgId: campaign.orgId,
              sessionId: campaign.sessionId,
            },
            `campaign-exec-${campaign.id}`,
          );

          // Emit event
          this.eventEmitter.emit(EVENT_NAMES.CAMPAIGN_STARTED, {
            campaignId: campaign.id,
            orgId: campaign.orgId,
            totalRecipients: 0,
          });

          // Audit log
          await this.auditService.log({
            orgId: campaign.orgId,
            action: AuditAction.CAMPAIGN_STARTED,
            targetType: 'Campaign',
            targetId: campaign.id,
            metadata: { triggeredBy: 'scheduler' },
          });

          this.logger.log(`Campaign ${campaign.id} triggered by scheduler`);
        } catch (error) {
          this.logger.error(
            `Failed to trigger campaign ${campaign.id}:`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } finally {
      // Always re-schedule next check
      await this.scheduleNextCheck();
    }
  }
}
