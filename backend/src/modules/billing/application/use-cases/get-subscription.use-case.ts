import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { UsageRepository } from '../../infrastructure/repositories/usage.repository';
import { UsageMetricType } from '@prisma/client';

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly usageRepo: UsageRepository,
  ) {}

  async execute(orgId: string) {
    const subscription = await this.subscriptionRepo.findByOrgWithPlan(orgId);
    if (!subscription) {
      return { subscription: null, usage: null };
    }

    // Get current usage for all metrics
    const usageRecords = await this.usageRepo.getAllUsageForPeriod(
      orgId,
      subscription.currentPeriodStart,
    );

    // Also get live counts for users and sessions
    const [activeUsers, activeSessions] = await Promise.all([
      this.usageRepo.getActiveUserCount(orgId),
      this.usageRepo.getActiveSessionCount(orgId),
    ]);

    const plan = subscription.plan;
    const usage = {
      messagesSent: {
        current: usageRecords.find(u => u.metricType === UsageMetricType.MESSAGES_SENT)?.currentValue ?? 0,
        limit: plan.maxMessagesPerMonth,
        percentUsed: 0,
      },
      campaignExecutions: {
        current: usageRecords.find(u => u.metricType === UsageMetricType.CAMPAIGN_EXECUTIONS)?.currentValue ?? 0,
        limit: plan.maxCampaignsPerMonth,
        percentUsed: 0,
      },
      activeUsers: {
        current: activeUsers,
        limit: plan.maxUsers,
        percentUsed: 0,
      },
      whatsappSessions: {
        current: activeSessions,
        limit: plan.maxWhatsappSessions,
        percentUsed: 0,
      },
    };

    // Calculate percentages
    for (const key of Object.keys(usage) as (keyof typeof usage)[]) {
      const entry = usage[key];
      entry.percentUsed = entry.limit > 0
        ? Math.round((entry.current / entry.limit) * 100)
        : 0;
    }

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          billingCycle: plan.billingCycle,
          priceInCents: plan.priceInCents,
          currency: plan.currency,
          campaignsEnabled: plan.campaignsEnabled,
          automationEnabled: plan.automationEnabled,
        },
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        cancelledAt: subscription.cancelledAt,
        scheduledPlanId: subscription.scheduledPlanId,
        scheduledChangeAt: subscription.scheduledChangeAt,
      },
      usage,
    };
  }
}
