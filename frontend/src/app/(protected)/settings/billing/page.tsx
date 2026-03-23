"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  Users,
  MessageSquare,
  Smartphone,
  Download,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Clock,
  FileText,
  X,
  TrendingUp,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthStore } from "@/stores/auth-store";
import {
  usePlans,
  useSubscription,
  usePayments,
  useInvoices,
  useSubscribeToPlan,
  useChangePlan,
  useCancelSubscription,
  useReactivateSubscription,
} from "@/hooks/use-billing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import type {
  Plan,
  SubscriptionStatus,
  PaymentStatus,
  InvoiceStatus,
} from "@/lib/types/billing";
import { formatPlanPrice, getPlanFeatures } from "@/lib/types/billing";

// ─── Status Helpers ───────────────────────────

function getStatusBadge(status: SubscriptionStatus) {
  const map: Record<
    SubscriptionStatus,
    { label: string; variant: "primary" | "success" | "warning" | "error" | "default" }
  > = {
    ACTIVE: { label: "Active", variant: "success" },
    TRIAL: { label: "Trial", variant: "warning" },
    GRACE_PERIOD: { label: "Grace Period", variant: "warning" },
    PAST_DUE: { label: "Past Due", variant: "error" },
    EXPIRED: { label: "Expired", variant: "error" },
    CANCELLED: { label: "Cancelled", variant: "default" },
  };
  const m = map[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function getPaymentStatusColor(status: PaymentStatus) {
  const map: Record<PaymentStatus, string> = {
    SUCCEEDED: "text-success",
    PROCESSING: "text-warning",
    FAILED: "text-error",
    PENDING: "text-on-surface-variant",
    REFUNDED: "text-on-surface-variant",
  };
  return map[status] ?? "text-on-surface-variant";
}

function getInvoiceStatusColor(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = {
    PAID: "text-success",
    OPEN: "text-warning",
    DRAFT: "text-on-surface-variant",
    VOID: "text-on-surface-variant",
    UNCOLLECTIBLE: "text-error",
  };
  return map[status] ?? "text-on-surface-variant";
}

// ─── Main Page ────────────────────────────────

export default function BillingPage() {
  usePageTitle("Billing");

  const user = useAuthStore((s) => s.user);
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subData, isLoading: subLoading } = useSubscription();
  const [paymentPage, setPaymentPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const [historyTab, setHistoryTab] = useState("payments");
  const { data: payments, isLoading: paymentsLoading } = usePayments({
    page: paymentPage,
    limit: 10,
  });
  const { data: invoices, isLoading: invoicesLoading } = useInvoices({
    page: invoicePage,
    limit: 10,
  });
  const subscribeMutation = useSubscribeToPlan();
  const changePlanMutation = useChangePlan();
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();

  // Upgrade/downgrade confirmation modal state
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-3" />
          <p className="text-[14px] text-on-surface-variant">
            You don&apos;t have permission to manage billing.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = plansLoading || subLoading;
  const subscription = subData?.subscription ?? null;
  const usage = subData?.usage ?? null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const canReactivate =
    subscription &&
    ["CANCELLED", "EXPIRED", "GRACE_PERIOD", "PAST_DUE"].includes(
      subscription.status,
    );

  const handlePlanAction = (plan: Plan) => {
    if (subscription && subscription.plan.id !== plan.id) {
      setConfirmPlan(plan);
    } else if (!subscription) {
      subscribeMutation.mutate(plan.id);
    }
  };

  const handleConfirmChange = () => {
    if (!confirmPlan) return;
    changePlanMutation.mutate(confirmPlan.id, {
      onSuccess: () => setConfirmPlan(null),
    });
  };

  const isUpgrade = confirmPlan
    ? confirmPlan.priceInCents > (subscription?.plan.priceInCents ?? 0)
    : false;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        {/* Breadcrumb + Header */}
        <div>
          <p className="text-[12px] text-on-surface-variant/60 mb-1">
            Settings &gt; Billing
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-on-surface">
                Billing &amp; Subscription
              </h1>
              <p className="text-[13px] text-on-surface-variant mt-1">
                Manage your plan, track usage, and view payment history.
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan — Gradient Hero Card */}
        {subscription && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-on-surface">
                    {subscription.plan.name}
                  </h2>
                  {getStatusBadge(subscription.status)}
                </div>
                <p className="text-[13px] text-on-surface-variant">
                  Your current billing period:{" "}
                  <span className="text-on-surface">
                    {formatDate(subscription.currentPeriodStart)} —{" "}
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </p>
                <p className="text-3xl font-bold text-primary mt-2">
                  ${(subscription.plan.priceInCents / 100).toFixed(2)}
                  <span className="text-sm font-normal text-on-surface-variant">
                    /{subscription.plan.billingCycle === "MONTHLY" ? "mo" : "yr"}
                  </span>
                </p>
                {subscription.trialEndsAt && subscription.status === "TRIAL" && (
                  <p className="text-[12px] text-warning mt-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Trial ends {formatDate(subscription.trialEndsAt)}
                  </p>
                )}
                {subscription.scheduledPlanId && subscription.scheduledChangeAt && (
                  <p className="text-[12px] text-warning mt-1 flex items-center gap-1.5">
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                    Downgrade scheduled for{" "}
                    {formatDate(subscription.scheduledChangeAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canReactivate && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => reactivateMutation.mutate()}
                    loading={reactivateMutation.isPending}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Reactivate
                  </Button>
                )}
                {subscription.status === "ACTIVE" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelMutation.mutate(undefined)}
                    disabled={cancelMutation.isPending}
                    className="text-error hover:text-error"
                  >
                    {cancelMutation.isPending ? "Cancelling..." : "Cancel Plan"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No subscription state */}
        {!subscription && (
          <Card className="border-warning/20">
            <CardContent className="!mt-0 !py-8 text-center">
              <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-3" />
              <p className="text-[15px] font-medium text-on-surface">
                No active subscription
              </p>
              <p className="text-[13px] text-on-surface-variant mt-1">
                Choose a plan below to get started.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Usage Metrics */}
        {usage && (
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-3">
              Current Usage
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <UsageCard
                icon={Users}
                label="Users"
                current={usage.activeUsers.current}
                limit={usage.activeUsers.limit}
              />
              <UsageCard
                icon={Smartphone}
                label="Sessions"
                current={usage.whatsappSessions.current}
                limit={usage.whatsappSessions.limit}
              />
              <UsageCard
                icon={MessageSquare}
                label="Messages"
                current={usage.messagesSent.current}
                limit={usage.messagesSent.limit}
              />
              <UsageCard
                icon={Zap}
                label="Campaigns"
                current={usage.campaignExecutions.current}
                limit={usage.campaignExecutions.limit}
              />
            </div>
          </div>
        )}

        {/* Subscription Tiers */}
        {plans && plans.length > 0 && (
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-3">
              Subscription Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plans
                .filter((p) => p.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((plan) => {
                  const isCurrent = subscription?.plan.id === plan.id;
                  const hasSubscription = !!subscription;
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isCurrent={isCurrent}
                      onSelect={() => handlePlanAction(plan)}
                      isLoading={
                        subscribeMutation.isPending || changePlanMutation.isPending
                      }
                      buttonLabel={
                        isCurrent
                          ? "Active Plan"
                          : hasSubscription
                            ? plan.priceInCents >
                              (subscription?.plan.priceInCents ?? 0)
                              ? "Upgrade"
                              : "Downgrade"
                            : "Select Plan"
                      }
                    />
                  );
                })}
            </div>
          </div>
        )}

        {/* Billing History — Payments & Invoices */}
        <Card>
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              Billing History
            </h3>
            <Tabs
              tabs={[
                { id: "payments", label: "Payments" },
                { id: "invoices", label: "Invoices" },
              ]}
              activeTab={historyTab}
              onTabChange={setHistoryTab}
            />
          </div>

          {/* Payments Tab */}
          {historyTab === "payments" && (
            <div className="mt-4">
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" className="text-primary" />
                </div>
              ) : !payments?.data?.length ? (
                <div className="text-center py-12">
                  <CreditCard className="h-10 w-10 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-[13px] text-on-surface-variant">
                    No payment history yet
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-outline-variant/15">
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.data.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors"
                          >
                            <td className="px-6 py-3.5 text-[13px] text-on-surface">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-3.5 text-[13px] text-on-surface font-medium">
                              ${(payment.amountInCents / 100).toFixed(2)}{" "}
                              <span className="text-[11px] text-on-surface-variant font-normal">
                                {payment.currency}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-[13px] text-on-surface-variant">
                              {payment.paymentMethod ?? "—"}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`text-[12px] font-medium ${getPaymentStatusColor(payment.status)}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {payments.totalPages > 1 && (
                    <Paginator
                      page={paymentPage}
                      totalPages={payments.totalPages}
                      onPageChange={setPaymentPage}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {historyTab === "invoices" && (
            <div className="mt-4">
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" className="text-primary" />
                </div>
              ) : !invoices?.data?.length ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-on-surface-variant/30 mx-auto mb-3" />
                  <p className="text-[13px] text-on-surface-variant">
                    No invoices yet
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-outline-variant/15">
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Period
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.data.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors"
                          >
                            <td className="px-6 py-3.5 text-[13px] text-on-surface font-medium">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-6 py-3.5 text-[13px] text-on-surface-variant">
                              {formatDate(invoice.periodStart)} —{" "}
                              {formatDate(invoice.periodEnd)}
                            </td>
                            <td className="px-6 py-3.5 text-[13px] text-on-surface font-medium">
                              ${(invoice.amountInCents / 100).toFixed(2)}{" "}
                              <span className="text-[11px] text-on-surface-variant font-normal">
                                {invoice.currency}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`text-[12px] font-medium ${getInvoiceStatusColor(invoice.status)}`}
                              >
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              {invoice.pdfUrl ? (
                                <a
                                  href={invoice.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              ) : (
                                <span className="text-[12px] text-on-surface-variant/40">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {invoices.totalPages > 1 && (
                    <Paginator
                      page={invoicePage}
                      totalPages={invoices.totalPages}
                      onPageChange={setInvoicePage}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Upgrade/Downgrade Confirmation Modal */}
      {confirmPlan && subscription && (
        <UpgradeConfirmModal
          currentPlan={subscription.plan}
          newPlan={confirmPlan}
          isUpgrade={isUpgrade}
          isLoading={changePlanMutation.isPending}
          onConfirm={handleConfirmChange}
          onCancel={() => setConfirmPlan(null)}
        />
      )}
    </div>
  );
}

// ─── Usage Card (Stitch-aligned) ──────────────

function UsageCard({
  icon: Icon,
  label,
  current,
  limit,
}: {
  icon: typeof Users;
  label: string;
  current: number;
  limit: number;
}) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center">
              <Icon className="h-4 w-4 text-on-surface-variant" />
            </div>
            <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
              {label}
            </span>
          </div>
          {isAtLimit && (
            <AlertTriangle className="h-4 w-4 text-error" />
          )}
          {isNearLimit && !isAtLimit && (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-on-surface">
            {current.toLocaleString()}
          </span>
          <span className="text-[12px] text-on-surface-variant">
            / {limit > 0 ? limit.toLocaleString() : "∞"}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-on-surface-variant/60">
            {pct.toFixed(0)}% used
          </span>
        </div>
      </div>
      {/* Progress bar at bottom edge */}
      <div className="h-1 bg-surface-container-high">
        <div
          className={`h-full transition-all ${
            isAtLimit
              ? "bg-error"
              : isNearLimit
                ? "bg-warning"
                : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

// ─── Plan Card (Stitch-aligned) ────────────────

function PlanCard({
  plan,
  isCurrent,
  onSelect,
  isLoading,
  buttonLabel,
}: {
  plan: Plan;
  isCurrent: boolean;
  onSelect: () => void;
  isLoading: boolean;
  buttonLabel: string;
}) {
  const features = getPlanFeatures(plan);

  return (
    <Card
      className={`!p-0 overflow-hidden flex flex-col ${
        isCurrent
          ? "border-primary/30 ring-1 ring-primary/20"
          : "hover:border-outline-variant/30 transition-colors"
      }`}
    >
      {isCurrent && (
        <div className="bg-primary/10 px-4 py-1.5 text-center">
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            Active Plan
          </span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        {/* Plan name + description */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-on-surface">
            {plan.name}
          </h3>
          {plan.description && (
            <p className="text-[12px] text-on-surface-variant/70 mt-0.5">
              {plan.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-on-surface">
            {formatPlanPrice(plan)}
          </span>
          <span className="text-[13px] text-on-surface-variant">
            /{plan.billingCycle === "MONTHLY" ? "mo" : "yr"}
          </span>
        </div>

        {/* Limits */}
        <div className="space-y-2.5 flex-1">
          <LimitRow label="Users" value={formatLimit(plan.maxUsers)} />
          <LimitRow
            label="Sessions"
            value={formatLimit(plan.maxWhatsappSessions)}
          />
          <LimitRow
            label="Messages/mo"
            value={formatLimit(plan.maxMessagesPerMonth)}
          />
          <LimitRow
            label="Campaigns/mo"
            value={formatLimit(plan.maxCampaignsPerMonth)}
          />
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-1.5 pt-3 mt-3 border-t border-outline-variant/10">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[12px] text-on-surface-variant">
                  {f}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full mt-4"
          variant={isCurrent ? "secondary" : buttonLabel === "Upgrade" ? "primary" : "secondary"}
          size="sm"
          disabled={isCurrent || isLoading}
          onClick={onSelect}
        >
          {isCurrent ? (
            "Active Plan"
          ) : isLoading ? (
            "Processing..."
          ) : buttonLabel === "Upgrade" ? (
            <>
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
              {buttonLabel}
            </>
          ) : buttonLabel === "Downgrade" ? (
            <>
              <ArrowDownCircle className="h-3.5 w-3.5 mr-1.5" />
              {buttonLabel}
            </>
          ) : (
            buttonLabel
          )}
        </Button>
      </div>
    </Card>
  );
}

// ─── Upgrade Confirmation Modal (from Stitch) ──

function UpgradeConfirmModal({
  currentPlan,
  newPlan,
  isUpgrade,
  isLoading,
  onConfirm,
  onCancel,
}: {
  currentPlan: { name: string; priceInCents: number; billingCycle: string };
  newPlan: Plan;
  isUpgrade: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const currentPrice = currentPlan.priceInCents / 100;
  const newPrice = newPlan.priceInCents / 100;
  const cycleSuffix = newPlan.billingCycle === "MONTHLY" ? "mo" : "yr";

  // Estimate proration for upgrades (approximate — server calculates exact)
  const daysInPeriod = newPlan.billingCycle === "MONTHLY" ? 30 : 365;
  const estimatedDaysRemaining = Math.round(daysInPeriod / 2); // rough midpoint
  const credit = (currentPrice / daysInPeriod) * estimatedDaysRemaining;
  const charge = (newPrice / daysInPeriod) * estimatedDaysRemaining;
  const net = charge - credit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            {isUpgrade ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-warning" />
            )}
            <h2 className="text-lg font-semibold text-on-surface">
              {isUpgrade ? "Confirm Upgrade" : "Confirm Downgrade"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Plan Comparison */}
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-xl bg-surface-container p-4 text-center">
              <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">
                Current
              </p>
              <p className="text-[15px] font-semibold text-on-surface">
                {currentPlan.name}
              </p>
              <p className="text-sm text-on-surface-variant mt-0.5">
                ${currentPrice.toFixed(2)}/{cycleSuffix}
              </p>
            </div>
            <div className="text-on-surface-variant/50">→</div>
            <div className="flex-1 rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-[11px] text-primary uppercase tracking-wider mb-1">
                New Plan
              </p>
              <p className="text-[15px] font-semibold text-on-surface">
                {newPlan.name}
              </p>
              <p className="text-sm text-primary mt-0.5">
                ${newPrice.toFixed(2)}/{cycleSuffix}
              </p>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="rounded-xl bg-surface-container/50 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                    Feature
                  </th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                    Current
                  </th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-primary">
                    New
                  </th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Users"
                  current={formatLimit(0)}
                  next={formatLimit(newPlan.maxUsers)}
                />
                <CompareRow
                  label="Sessions"
                  current={formatLimit(0)}
                  next={formatLimit(newPlan.maxWhatsappSessions)}
                />
                <CompareRow
                  label="Messages/mo"
                  current={formatLimit(0)}
                  next={formatLimit(newPlan.maxMessagesPerMonth)}
                />
                <CompareRow
                  label="Campaigns/mo"
                  current={formatLimit(0)}
                  next={formatLimit(newPlan.maxCampaignsPerMonth)}
                />
              </tbody>
            </table>
          </div>

          {/* Proration Details (upgrades only) */}
          {isUpgrade && (
            <div className="rounded-xl bg-surface-container p-4 space-y-2">
              <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Estimated Proration
              </p>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-on-surface-variant">
                  Credit for remaining period
                </span>
                <span className="text-success font-medium">
                  -${credit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-on-surface-variant">
                  New plan charge (prorated)
                </span>
                <span className="text-on-surface font-medium">
                  ${charge.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-outline-variant/15 pt-2 mt-2">
                <div className="flex items-center justify-between text-[14px] font-semibold">
                  <span className="text-on-surface">Amount due today</span>
                  <span className="text-primary">${net.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 mt-1">
                Exact proration will be calculated by the server based on your
                current billing period.
              </p>
            </div>
          )}

          {/* Downgrade note */}
          {!isUpgrade && (
            <div className="rounded-xl bg-warning-container/30 border border-warning/10 p-4">
              <p className="text-[13px] text-on-surface">
                Your downgrade will take effect at the end of your current
                billing period. You&apos;ll keep your current plan until then.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              loading={isLoading}
            >
              {isUpgrade ? "Confirm Upgrade" : "Confirm Downgrade"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  current,
  next,
}: {
  label: string;
  current: string;
  next: string;
}) {
  return (
    <tr className="border-b border-outline-variant/10 last:border-0">
      <td className="px-4 py-2.5 text-on-surface-variant">{label}</td>
      <td className="px-4 py-2.5 text-center text-on-surface-variant">
        {current}
      </td>
      <td className="px-4 py-2.5 text-center text-on-surface font-medium">
        {next}
      </td>
    </tr>
  );
}

function LimitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-on-surface-variant">{label}</span>
      <span className="text-[12px] font-medium text-on-surface">{value}</span>
    </div>
  );
}

// ─── Paginator ──────────────────────────────────

function Paginator({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-outline-variant/15">
      <span className="text-[12px] text-on-surface-variant">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLimit(value: number): string {
  if (value <= 0) return "Unlimited";
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toLocaleString();
}
