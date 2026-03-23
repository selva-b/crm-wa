// ─── Plan ───

export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIAL"
  | "EXPIRED"
  | "CANCELLED"
  | "PAST_DUE"
  | "GRACE_PERIOD";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  billingCycle: BillingCycle;
  priceInCents: number;
  currency: string;
  version: number;
  isActive: boolean;
  isDefault: boolean;
  trialDays: number;
  sortOrder: number;
  // Limits
  maxUsers: number;
  maxWhatsappSessions: number;
  maxMessagesPerMonth: number;
  maxCampaignsPerMonth: number;
  // Feature flags
  campaignsEnabled: boolean;
  automationEnabled: boolean;
  // Thresholds
  softLimitPercent: number;
  gracePeriodDays: number;
  createdAt: string;
}

// Convenience helpers for display
export function formatPlanPrice(plan: Plan): string {
  const dollars = (plan.priceInCents / 100).toFixed(2);
  return `$${dollars}`;
}

export function getPlanLimits(plan: Plan) {
  return {
    maxUsers: plan.maxUsers,
    maxSessions: plan.maxWhatsappSessions,
    maxMessagesPerMonth: plan.maxMessagesPerMonth,
    maxCampaignsPerMonth: plan.maxCampaignsPerMonth,
  };
}

export function getPlanFeatures(plan: Plan): string[] {
  const features: string[] = [];
  if (plan.campaignsEnabled) features.push("Campaigns");
  if (plan.automationEnabled) features.push("Automation");
  if (plan.trialDays > 0) features.push(`${plan.trialDays}-day free trial`);
  return features;
}

// ─── Subscription ───

export interface SubscriptionPlanSummary {
  id: string;
  name: string;
  slug: string;
  billingCycle: BillingCycle;
  priceInCents: number;
  currency: string;
  campaignsEnabled: boolean;
  automationEnabled: boolean;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlanSummary;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
  scheduledPlanId?: string | null;
  scheduledChangeAt?: string | null;
}

// ─── Usage ───

export interface UsageEntry {
  current: number;
  limit: number;
  percentUsed: number;
}

export interface UsageMetrics {
  messagesSent: UsageEntry;
  campaignExecutions: UsageEntry;
  activeUsers: UsageEntry;
  whatsappSessions: UsageEntry;
}

export interface SubscriptionWithUsage {
  subscription: Subscription | null;
  usage: UsageMetrics | null;
}

// ─── Change Plan Response ───

export interface ChangePlanResponse {
  subscription: Subscription;
  type: "upgrade" | "downgrade";
  effectiveImmediately: boolean;
  proration?: {
    creditAmountInCents: number;
    chargeAmountInCents: number;
    netAmountInCents: number;
    daysRemainingInPeriod: number;
    totalDaysInPeriod: number;
  };
  scheduledAt?: string;
  deduplicated: boolean;
}

// ─── Payment / Invoice ───

export interface Payment {
  id: string;
  orgId: string;
  subscriptionId: string;
  amountInCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  failedReason?: string;
  retryCount: number;
  paidAt?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orgId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amountInCents: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  lineItems: { description: string; amount: number; quantity: number }[];
  pdfUrl?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
}
