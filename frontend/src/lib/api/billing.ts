import apiClient from "./client";
import type {
  Plan,
  SubscriptionWithUsage,
  ChangePlanResponse,
  Payment,
  Invoice,
  PaginatedResponse,
  ListPaymentsParams,
  ListInvoicesParams,
} from "@/lib/types/billing";

export const billingApi = {
  // ─── Plans ───

  listPlans: () =>
    apiClient
      .get<{ plans: Plan[] }>("/billing/plans")
      .then((r) => r.data.plans),

  // ─── Subscription + Usage (single endpoint) ───

  getSubscription: () =>
    apiClient
      .get<SubscriptionWithUsage>("/billing/subscription")
      .then((r) => r.data),

  subscribe: (planId: string, idempotencyKey?: string) =>
    apiClient
      .post<{ subscription: any; deduplicated: boolean }>("/billing/subscribe", {
        planId,
        idempotencyKey,
      })
      .then((r) => r.data),

  changePlan: (newPlanId: string, idempotencyKey?: string) =>
    apiClient
      .post<ChangePlanResponse>("/billing/change-plan", {
        newPlanId,
        idempotencyKey,
      })
      .then((r) => r.data),

  cancelSubscription: (reason?: string) =>
    apiClient
      .post<{ subscription: any }>("/billing/cancel", { reason })
      .then((r) => r.data),

  reactivateSubscription: () =>
    apiClient
      .post<{ subscription: any }>("/billing/reactivate")
      .then((r) => r.data),

  // ─── Invoices ───

  listInvoices: (params?: ListInvoicesParams) =>
    apiClient
      .get<PaginatedResponse<Invoice>>("/billing/invoices", { params })
      .then((r) => r.data),

  // ─── Payments ───

  listPayments: (params?: ListPaymentsParams) =>
    apiClient
      .get<PaginatedResponse<Payment>>("/billing/payments", { params })
      .then((r) => r.data),
};
