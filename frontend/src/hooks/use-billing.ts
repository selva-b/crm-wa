"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";
import type { ListPaymentsParams, ListInvoicesParams } from "@/lib/types/billing";

// ─── Query Key Factory ───

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => ["billing", "plans"] as const,
  subscription: () => ["billing", "subscription"] as const,
  payments: (params?: ListPaymentsParams) =>
    ["billing", "payments", params] as const,
  invoices: (params?: ListInvoicesParams) =>
    ["billing", "invoices", params] as const,
};

// ─── Query Hooks ───

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingApi.listPlans(),
  });
}

/** Returns { subscription, usage } in a single call */
export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => billingApi.getSubscription(),
  });
}

export function usePayments(params?: ListPaymentsParams) {
  return useQuery({
    queryKey: billingKeys.payments(params),
    queryFn: () => billingApi.listPayments(params),
  });
}

export function useInvoices(params?: ListInvoicesParams) {
  return useQuery({
    queryKey: billingKeys.invoices(params),
    queryFn: () => billingApi.listInvoices(params),
  });
}

// ─── Mutation Hooks ───

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => billingApi.subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPlanId: string) => billingApi.changePlan(newPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => billingApi.cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => billingApi.reactivateSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}
