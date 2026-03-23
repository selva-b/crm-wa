import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '@/common/constants';
import {
  SubscriptionCreatedEvent,
  SubscriptionUpgradedEvent,
  SubscriptionCancelledEvent,
  SubscriptionExpiredEvent,
  SubscriptionGracePeriodEvent,
  PaymentSucceededEvent,
  PaymentFailedEvent,
  UsageLimitReachedEvent,
  UsageSoftLimitWarningEvent,
  UsageCounterResetEvent,
} from '../event-bus';

@Injectable()
export class BillingEventsHandler {
  private readonly logger = new Logger(BillingEventsHandler.name);

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CREATED)
  async onSubscriptionCreated(event: SubscriptionCreatedEvent) {
    this.logger.log(
      `Subscription created: ${event.subscriptionId} for org ${event.orgId} on plan ${event.planName}`,
    );
    // TODO: Send welcome email with plan details
    // TODO: Emit WebSocket notification to org admins
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_UPGRADED)
  async onSubscriptionUpgraded(event: SubscriptionUpgradedEvent) {
    this.logger.log(
      `Subscription ${event.subscriptionId} upgraded for org ${event.orgId}`,
    );
    // TODO: Send upgrade confirmation email
    // TODO: Emit WebSocket notification
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_CANCELLED)
  async onSubscriptionCancelled(event: SubscriptionCancelledEvent) {
    this.logger.log(
      `Subscription ${event.subscriptionId} cancelled for org ${event.orgId}`,
    );
    // TODO: Send cancellation confirmation email
    // TODO: Cancel any external payment gateway subscription
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_EXPIRED)
  async onSubscriptionExpired(event: SubscriptionExpiredEvent) {
    this.logger.log(
      `Subscription ${event.subscriptionId} expired for org ${event.orgId}`,
    );
    // TODO: Send expiration notice email with reactivation link
    // TODO: Emit WebSocket notification showing upgrade prompt
  }

  @OnEvent(EVENT_NAMES.SUBSCRIPTION_GRACE_PERIOD)
  async onSubscriptionGracePeriod(event: SubscriptionGracePeriodEvent) {
    this.logger.log(
      `Subscription ${event.subscriptionId} entered grace period for org ${event.orgId}, ` +
      `ends at ${event.graceEndsAt}`,
    );
    // TODO: Send grace period warning email
  }

  @OnEvent(EVENT_NAMES.PAYMENT_SUCCEEDED)
  async onPaymentSucceeded(event: PaymentSucceededEvent) {
    this.logger.log(
      `Payment ${event.paymentId} succeeded for org ${event.orgId}: ${event.amountInCents} cents`,
    );
    // TODO: Send payment receipt email
  }

  @OnEvent(EVENT_NAMES.PAYMENT_FAILED)
  async onPaymentFailed(event: PaymentFailedEvent) {
    this.logger.warn(
      `Payment ${event.paymentId} failed for org ${event.orgId}: ${event.reason}`,
    );
    // TODO: Send payment failure notification email
    // TODO: Notify org admins via WebSocket
  }

  @OnEvent(EVENT_NAMES.USAGE_LIMIT_REACHED)
  async onUsageLimitReached(event: UsageLimitReachedEvent) {
    this.logger.warn(
      `Usage limit reached for org ${event.orgId}: ${event.metricType} ` +
      `(${event.currentValue}/${event.limitValue})`,
    );
    // TODO: Send upgrade prompt via WebSocket to all connected users in org
    // TODO: Send email to org admin about limit reached
  }

  @OnEvent(EVENT_NAMES.USAGE_SOFT_LIMIT_WARNING)
  async onUsageSoftLimitWarning(event: UsageSoftLimitWarningEvent) {
    this.logger.log(
      `Soft limit warning for org ${event.orgId}: ${event.metricType} ` +
      `at ${event.percentUsed}% (${event.currentValue}/${event.limitValue})`,
    );
    // TODO: Send warning notification via WebSocket
    // TODO: Send email if first time crossing soft limit this period
  }

  @OnEvent(EVENT_NAMES.USAGE_COUNTER_RESET)
  async onUsageCounterReset(event: UsageCounterResetEvent) {
    this.logger.log(
      `Usage counters reset for org ${event.orgId}: ${event.metricTypes.join(', ')}`,
    );
  }
}
