"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Users, MessageSquare, Zap, Bot, Code2, Sparkles, CreditCard } from "lucide-react";
import { usePlans, useSubscribeToPlan, useCreateOrder, useVerifyPayment } from "@/hooks/use-billing";
import { useAuthStore } from "@/stores/auth-store";
import { Spinner } from "@/components/ui/spinner";
import type { Plan, BillingCycle } from "@/lib/types/billing";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(cents: number) {
  return `₹${(cents / 100).toLocaleString("en-IN")}`;
}

function formatLimit(val: number) {
  if (val === 0) return "Unlimited";
  if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return `${val}`;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Welcome", "Choose Plan", "Confirm"];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < current
                  ? "bg-indigo-600 text-white"
                  : i === current
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                i === current ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-px ${i < current ? "bg-indigo-300" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ orgName, onNext }: { orgName: string; onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-indigo-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to CRM-WA{orgName ? `, ${orgName}` : ""}!
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        You're one step away from transforming your WhatsApp into a powerful sales and support engine.
        Let's get you set up in under 2 minutes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left max-w-lg mx-auto">
        {[
          { icon: MessageSquare, title: "Shared Inbox", desc: "Your whole team in one WhatsApp inbox" },
          { icon: Zap, title: "Campaigns", desc: "Broadcast messages to thousands at once" },
          { icon: Bot, title: "Automation", desc: "Auto-reply and workflow rules" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-gray-50 rounded-xl p-4">
            <Icon className="w-5 h-5 text-indigo-600 mb-2" />
            <div className="font-semibold text-sm text-gray-900">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
      >
        Choose Your Plan
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 1: Choose Plan ──────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  yearly,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  yearly: boolean;
  onSelect: () => void;
}) {
  const perMonth = yearly
    ? Math.round(plan.priceInCents / 12)
    : plan.priceInCents;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? "border-indigo-600 bg-indigo-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-900">{plan.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{plan.description}</div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <div className="font-bold text-gray-900">{formatINR(perMonth)}<span className="text-xs font-normal text-gray-400">/mo</span></div>
          {plan.trialDays > 0 && (
            <div className="text-xs text-green-600 font-medium">{plan.trialDays}-day free trial</div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatLimit(plan.maxUsers)} agents</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{formatLimit(plan.maxMessagesPerMonth)} msgs/mo</span>
        {plan.automationEnabled && <span className="flex items-center gap-1"><Bot className="w-3 h-3" />Automation</span>}
        {(plan as any).apiEnabled && <span className="flex items-center gap-1"><Code2 className="w-3 h-3" />API</span>}
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium">
          <Check className="w-3.5 h-3.5" /> Selected
        </div>
      )}
    </button>
  );
}

function ChoosePlanStep({
  plans,
  selectedId,
  onSelect,
  yearly,
  onYearlyToggle,
  onNext,
  onBack,
}: {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  yearly: boolean;
  onYearlyToggle: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const cycle: BillingCycle = yearly ? "YEARLY" : "MONTHLY";
  const filtered = plans
    .filter((p) => p.billingCycle === cycle && p.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Choose your plan</h2>
        <p className="text-sm text-gray-500 mt-1">
          Starter &amp; Growth include a free trial — no card needed
        </p>
      </div>

      {/* Cycle toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
        <button
          onClick={onYearlyToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-indigo-600" : "bg-gray-200"}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className={`text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-400"}`}>
          Yearly
          <span className="ml-1.5 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">Save 17%</span>
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {filtered.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedId === plan.id}
            yearly={yearly}
            onSelect={() => onSelect(plan.id)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedId}
          className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Confirm ─────────────────────────────────────────────────────────

function ConfirmStep({
  plan,
  onConfirm,
  onBack,
  loading,
  error,
}: {
  plan: Plan;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  const hasTrial = plan.trialDays > 0;

  return (
    <div className="text-center">
      <div className={`w-16 h-16 ${hasTrial ? "bg-green-100" : "bg-indigo-100"} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
        {hasTrial ? <Check className="w-8 h-8 text-green-600" /> : <CreditCard className="w-8 h-8 text-indigo-600" />}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {hasTrial ? "Ready to start your free trial!" : `Subscribe to ${plan.name}`}
      </h2>
      <p className="text-gray-500 mb-6">
        {hasTrial
          ? <>You're starting a <strong>{plan.trialDays}-day free trial</strong> on the <strong>{plan.name}</strong> plan. No payment needed today.</>
          : <>Complete payment to activate your <strong>{plan.name}</strong> plan instantly.</>}
      </p>

      <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 max-w-sm mx-auto space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-gray-900">{plan.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Agents</span>
          <span className="font-medium text-gray-900">{formatLimit(plan.maxUsers)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Messages/mo</span>
          <span className="font-medium text-gray-900">{formatLimit(plan.maxMessagesPerMonth)}</span>
        </div>
        {hasTrial && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Trial period</span>
            <span className="font-medium text-green-600">{plan.trialDays} days free</span>
          </div>
        )}
        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
          <span className="text-gray-500">Due today</span>
          <span className="font-bold text-gray-900">{hasTrial ? "₹0" : formatINR(plan.priceInCents)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-left max-w-sm mx-auto">
          {error}
        </div>
      )}

      <div className="flex gap-3 max-w-sm mx-auto">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner className="w-4 h-4" />
              {hasTrial ? "Starting trial..." : "Processing..."}
            </>
          ) : (
            <>
              {hasTrial ? <Sparkles className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              {hasTrial ? "Start my free trial" : `Pay ${formatINR(plan.priceInCents)}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: plans, isLoading: plansLoading } = usePlans();
  const subscribeTrial = useSubscribeToPlan();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const [step, setStep] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) ?? null;
  const isLoading = subscribeTrial.isPending || createOrder.isPending || verifyPayment.isPending;

  const handleConfirm = async () => {
    if (!selectedPlanId || !selectedPlan) return;
    setError(null);

    // Trial plans: subscribe directly, no payment needed
    if (selectedPlan.trialDays > 0) {
      subscribeTrial.mutate(selectedPlanId, {
        onSuccess: () => router.push("/inbox"),
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? "Failed to start trial. Please try again.");
        },
      });
      return;
    }

    // Paid plans: open Razorpay checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Please check your connection and try again.");
      return;
    }

    createOrder.mutate(selectedPlanId, {
      onSuccess: (order) => {
        const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const options = {
          key: razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "CRM-WA",
          description: `${order.planName} Plan Subscription`,
          order_id: order.orderId,
          handler: (response: any) => {
            verifyPayment.mutate(
              {
                planId: selectedPlanId,
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                idempotencyKey: `onboarding-${user?.orgId ?? ""}-${selectedPlanId}`,
              },
              {
                onSuccess: () => router.push("/inbox"),
                onError: (err: any) => {
                  setError(err?.response?.data?.message ?? "Payment verification failed. Contact support.");
                },
              },
            );
          },
          prefill: {
            name: user ? `${user.firstName} ${user.lastName}` : "",
            email: user?.email ?? "",
          },
          theme: { color: "#4f46e5" },
          modal: {
            ondismiss: () => {
              setError("Payment was cancelled. Please try again.");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message ?? "Failed to create payment order. Please try again.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-start justify-center pt-12 px-4 pb-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-bold text-gray-900 text-xl">CRM-WA</span>
        </div>

        <Steps current={step} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {plansLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner />
            </div>
          ) : step === 0 ? (
            <WelcomeStep
              orgName={user?.firstName ?? ""}
              onNext={() => setStep(1)}
            />
          ) : step === 1 ? (
            <ChoosePlanStep
              plans={plans ?? []}
              selectedId={selectedPlanId}
              onSelect={(id) => {
                setSelectedPlanId(id);
                setError(null);
              }}
              yearly={yearly}
              onYearlyToggle={() => {
                setYearly((v) => !v);
                setSelectedPlanId(null);
                setError(null);
              }}
              onNext={() => selectedPlanId && setStep(2)}
              onBack={() => setStep(0)}
            />
          ) : selectedPlan ? (
            <ConfirmStep
              plan={selectedPlan}
              onConfirm={handleConfirm}
              onBack={() => { setStep(1); setError(null); }}
              loading={isLoading}
              error={error}
            />
          ) : null}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
