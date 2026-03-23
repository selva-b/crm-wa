import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlanRepository } from '../../infrastructure/repositories/plan.repository';
import { SubscriptionRepository } from '../../infrastructure/repositories/subscription.repository';
import { UsageRepository } from '../../infrastructure/repositories/usage.repository';
import { AuditService } from '@/modules/audit/domain/services/audit.service';
import { SubscribeDto } from '../dto/subscribe.dto';
import { EVENT_NAMES } from '@/common/constants';
import {
  AuditAction,
  SubscriptionStatus,
  UsageMetricType,
} from '@prisma/client';

@Injectable()
export class SubscribeUseCase {
  private readonly logger = new Logger(SubscribeUseCase.name);

  constructor(
    private readonly planRepo: PlanRepository,
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly usageRepo: UsageRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    orgId: string,
    userId: string,
    dto: SubscribeDto,
    ipAddress: string,
    userAgent: string,
  ) {
    // 1. Idempotency check
    if (dto.idempotencyKey) {
      const existing = await this.subscriptionRepo.findByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        return { subscription: existing, deduplicated: true };
      }
    }

    // 2. Check no active subscription exists
    const activeSubscription = await this.subscriptionRepo.findActiveByOrg(orgId);
    if (activeSubscription) {
      throw new ConflictException(
        'Organization already has an active subscription. Use upgrade/downgrade instead.',
      );
    }

    // 3. Validate plan exists and is active
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan || !plan.isActive || plan.deletedAt) {
      throw new NotFoundException('Plan not found or is no longer available');
    }

    // 4. Calculate period dates
    const now = new Date();
    const periodStart = now;
    const periodEnd = this.calculatePeriodEnd(now, plan.billingCycle);

    // 5. Determine initial status
    const hasTrial = plan.trialDays > 0;
    const isFree = plan.priceInCents === 0;
    let initialStatus: SubscriptionStatus;
    let trialEndsAt: Date | undefined;

    if (isFree) {
      initialStatus = SubscriptionStatus.ACTIVE;
    } else if (hasTrial) {
      initialStatus = SubscriptionStatus.TRIAL;
      trialEndsAt = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
    } else {
      // TODO: Process payment via payment gateway here
      // For now, if payment method token is provided, assume payment will be processed
      if (!dto.paymentMethodToken) {
        throw new BadRequestException(
          'Payment method is required for paid plans without a trial period',
        );
      }
      initialStatus = SubscriptionStatus.ACTIVE;
    }

    // 6. Create subscription
    const subscription = await this.subscriptionRepo.create({
      orgId,
      planId: plan.id,
      status: initialStatus,
      billingCycle: plan.billingCycle,
      priceInCents: plan.priceInCents,
      currency: plan.currency,
      trialEndsAt,
      currentPeriodStart: periodStart,
      currentPeriodEnd: hasTrial && trialEndsAt ? trialEndsAt : periodEnd,
      idempotencyKey: dto.idempotencyKey,
    });

    // 7. Initialize usage counters for the period
    const limits: Record<UsageMetricType, number> = {
      [UsageMetricType.MESSAGES_SENT]: plan.maxMessagesPerMonth,
      [UsageMetricType.ACTIVE_USERS]: plan.maxUsers,
      [UsageMetricType.WHATSAPP_SESSIONS]: plan.maxWhatsappSessions,
      [UsageMetricType.CAMPAIGN_EXECUTIONS]: plan.maxCampaignsPerMonth,
    };

    await this.usageRepo.resetUsageForOrg(
      orgId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      limits,
    );

    // 8. Record subscription event
    await this.subscriptionRepo.recordEvent({
      orgId,
      subscriptionId: subscription.id,
      newStatus: initialStatus,
      triggeredById: userId,
      metadata: {
        planName: plan.name,
        planSlug: plan.slug,
        priceInCents: plan.priceInCents,
        billingCycle: plan.billingCycle,
      },
    });

    // 9. Emit event
    this.eventEmitter.emit(EVENT_NAMES.SUBSCRIPTION_CREATED, {
      subscriptionId: subscription.id,
      orgId,
      planId: plan.id,
      planName: plan.name,
      status: initialStatus,
      userId,
    });

    // 10. Audit log
    await this.auditService.log({
      orgId,
      userId,
      action: AuditAction.SUBSCRIPTION_CREATED,
      targetType: 'Subscription',
      targetId: subscription.id,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        status: initialStatus,
        priceInCents: plan.priceInCents,
      },
      ipAddress,
      userAgent,
    });

    this.logger.log(
      `Subscription ${subscription.id} created for org ${orgId} on plan ${plan.name} (${initialStatus})`,
    );

    return { subscription, deduplicated: false };
  }

  private calculatePeriodEnd(start: Date, billingCycle: string): Date {
    const end = new Date(start);
    if (billingCycle === 'YEARLY') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }
}
