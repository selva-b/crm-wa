"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  MessageSquare,
  ToggleLeft,
  Bell,
  Webhook,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Globe,
  Clock,
  Plug,
  Send,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Zap,
  X,
  Code,
  Key,
  BarChart3,
  FileCode,
  Activity,
  Shield,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthStore } from "@/stores/auth-store";
import {
  useOrgSettings,
  useWhatsAppConfig,
  useWorkingHours,
  useUpdateWorkingHours,
  useFeatureFlags,
  useWebhooks,
  useUpdateOrgSettings,
  useUpdateWhatsAppConfig,
  useUpdateFeatureFlags,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookDeliveries,
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useTestIntegration,
} from "@/hooks/use-settings";
import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/hooks/use-notifications";
import {
  useDeveloperDashboard,
  useDeveloperLogs,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useRotateApiKey,
} from "@/hooks/use-developer";
import type { DeveloperApiKey } from "@/lib/types/developer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import type {
  UpdateOrgSettingsRequest,
  UpdateWhatsAppConfigRequest,
  FeatureFlags as FeatureFlagsType,
  Webhook as WebhookType,
  WebhookDelivery,
  WebhookDeliveryStatus,
  IntegrationConfig,
  IntegrationProvider,
  WEBHOOK_EVENT_TYPES,
} from "@/lib/types/settings";
import type {
  NotificationType,
  NotificationPreference,
} from "@/lib/types/notifications";
import { SlaPolicyList } from "@/components/sla/sla-policy-list";
import { SlaPolicyForm } from "@/components/sla/sla-policy-form";
import {
  useSlaPolicies,
  useCreateSlaPolicy,
  useUpdateSlaPolicy,
  useDeleteSlaPolicy,
} from "@/hooks/use-sla";
import type { SlaPolicy } from "@/lib/types/sla";

type SettingsTab =
  | "organization"
  | "whatsapp"
  | "working-hours"
  | "features"
  | "notifications"
  | "integrations"
  | "webhooks"
  | "developer-api"
  | "sla";

const TABS: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "working-hours", label: "Working Hours", icon: Clock },
  { id: "features", label: "Feature Flags", icon: ToggleLeft },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "developer-api", label: "Developer API", icon: Code },
  { id: "sla", label: "SLA Policies", icon: Shield },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

function EmployeeSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings/whatsapp");
  }, [router]);
  return null;
}

export default function SettingsPage() {
  usePageTitle("Settings");

  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const VALID_TABS: SettingsTab[] = ["organization","whatsapp","working-hours","features","notifications","integrations","webhooks","developer-api","sla"];
  const rawTab = searchParams.get("tab");
  const tabParam: SettingsTab | null = rawTab && VALID_TABS.includes(rawTab as SettingsTab) ? (rawTab as SettingsTab) : null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam ?? "organization");

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  if (user?.role !== "ADMIN") {
    return <EmployeeSettingsRedirect />;
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Settings</h1>
        <p className="text-[13px] text-on-surface-variant mt-1">
          Manage your organization, integrations, and system configuration
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "organization" && <OrganizationSection />}
          {activeTab === "whatsapp" && <WhatsAppSection />}
          {activeTab === "working-hours" && <WorkingHoursSection />}
          {activeTab === "features" && (
            <>
              <FeatureFlagsSection />
              <AiSettingsSection />
            </>
          )}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "integrations" && <IntegrationsSection />}
          {activeTab === "webhooks" && <WebhooksSection />}
          {activeTab === "developer-api" && <DeveloperApiSection />}
          {activeTab === "sla" && <SlaSection />}
        </div>
      </div>
    </div>
  );
}

// ─── Organization Section ───────────────────────

function OrganizationSection() {
  const { data, isLoading } = useOrgSettings();
  const updateMutation = useUpdateOrgSettings();

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setTimezone(data.timezone ?? "UTC");
      setLanguage(data.language ?? "en");
    }
  }, [data]);

  const handleSave = () => {
    const payload: UpdateOrgSettingsRequest = { name, timezone, language };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5" />
          Organization Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Org Name */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="My Organization"
          />
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {updateMutation.isSuccess && (
            <span className="ml-3 text-[12px] text-primary">Saved!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── WhatsApp Section ───────────────────────────

function WhatsAppSection() {
  const { data, isLoading } = useWhatsAppConfig();
  const updateMutation = useUpdateWhatsAppConfig();

  const [messageDelay, setMessageDelay] = useState(1000);
  const [retryLimit, setRetryLimit] = useState(3);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(3600);

  useEffect(() => {
    if (data) {
      setMessageDelay(data.messageDelay ?? 1000);
      setRetryLimit(data.retryLimit ?? 3);
      setAutoReconnect(data.autoReconnect ?? true);
      setSessionTimeout(data.sessionTimeout ?? 3600);
    }
  }, [data]);

  const handleSave = () => {
    const payload: UpdateWhatsAppConfigRequest = {
      messageDelay,
      retryLimit,
      autoReconnect,
      sessionTimeout,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* WhatsApp QR Connect */}
        <Link
          href="/settings/whatsapp"
          className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 bg-surface-container/10 hover:bg-surface-container/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-on-surface">
                WhatsApp Connection
              </p>
              <p className="text-[11px] text-on-surface-variant/60">
                Scan QR code to connect or manage your WhatsApp session
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors" />
        </Link>

        {/* Chat Widget */}
        <Link
          href="/settings/chat-widget"
          className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 bg-surface-container/10 hover:bg-surface-container/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-on-surface">
                Chat Widget
              </p>
              <p className="text-[11px] text-on-surface-variant/60">
                Embed a chat widget on your website to connect visitors to WhatsApp
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors" />
        </Link>

        {/* Custom Fields */}
        <Link
          href="/settings/custom-fields"
          className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 bg-surface-container/10 hover:bg-surface-container/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ToggleLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-on-surface">Custom Fields</p>
              <p className="text-[11px] text-on-surface-variant/60">Define custom fields for contacts, deals, and conversations</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors" />
        </Link>

        {/* API Keys */}
        <Link
          href="/settings/api-keys"
          className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 bg-surface-container/10 hover:bg-surface-container/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-on-surface">API Keys</p>
              <p className="text-[11px] text-on-surface-variant/60">Manage API keys for third-party integrations</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors" />
        </Link>

        {/* Message Delay */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Message Delay (ms)
          </label>
          <input
            type="number"
            value={messageDelay}
            onChange={(e) => setMessageDelay(Number(e.target.value))}
            min={500}
            max={10000}
            step={100}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-[11px] text-on-surface-variant/60">
            Delay between sending messages (500ms - 10,000ms)
          </p>
        </div>

        {/* Retry Limit */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
            Retry Limit
          </label>
          <input
            type="number"
            value={retryLimit}
            onChange={(e) => setRetryLimit(Number(e.target.value))}
            min={0}
            max={10}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-[11px] text-on-surface-variant/60">
            Max retries for failed message delivery
          </p>
        </div>

        {/* Auto Reconnect */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] font-medium text-on-surface">
              Auto Reconnect
            </p>
            <p className="text-[11px] text-on-surface-variant/60">
              Automatically reconnect on session disconnect
            </p>
          </div>
          <button
            onClick={() => setAutoReconnect(!autoReconnect)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoReconnect ? "bg-primary" : "bg-outline-variant/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoReconnect ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Session Timeout */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
            Session Timeout (seconds)
          </label>
          <input
            type="number"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(Number(e.target.value))}
            min={300}
            max={86400}
            step={300}
            className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {updateMutation.isSuccess && (
            <span className="ml-3 text-[12px] text-primary">Saved!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Working Hours Section ──────────────────────

function WorkingHoursSection() {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const { data, isLoading } = useWorkingHours();
  const updateMutation = useUpdateWorkingHours();

  const [enabled, setEnabled] = useState(true);
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("18:00");
  const [workDays, setWorkDays] = useState([true, true, true, true, true, false, false]);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState(
    "Thanks for reaching out! We're currently outside business hours. We'll get back to you as soon as we're open."
  );

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled ?? true);
      setStartHour(data.startHour ?? "09:00");
      setEndHour(data.endHour ?? "18:00");
      setWorkDays(data.workDays ?? [true, true, true, true, true, false, false]);
      setAutoReplyEnabled(data.autoReplyEnabled ?? false);
      setAutoReplyMessage(data.autoReplyMessage ?? "");
    }
  }, [data]);

  const toggleDay = (idx: number) => {
    const next = [...workDays];
    next[idx] = !next[idx];
    setWorkDays(next);
  };

  const handleSave = () => {
    updateMutation.mutate({ enabled, startHour, endHour, workDays, autoReplyEnabled, autoReplyMessage });
  };

  if (isLoading) return <SectionLoader />;

  return (
    <div className="space-y-6">
      {/* Working Hours */}
      <div>
        <h3 className="text-[15px] font-semibold text-on-surface mb-1">
          Business Hours
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-4">
          Set your team&apos;s availability hours. Outside these hours, auto-reply can be sent to customers.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant/30 accent-primary"
            />
            <span className="text-[13px] text-on-surface">Enable business hours</span>
          </label>

          {enabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-on-surface-variant">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-on-surface-variant mb-2 block">
                  Working Days
                </label>
                <div className="flex gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(i)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        workDays[i]
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container text-on-surface-variant/50 hover:text-on-surface-variant"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auto-Reply */}
      <div className="border-t border-outline-variant/15 pt-6">
        <h3 className="text-[15px] font-semibold text-on-surface mb-1">
          Auto-Reply (Outside Hours)
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-4">
          Automatically reply to customers when a message is received outside working hours.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReplyEnabled}
              onChange={(e) => setAutoReplyEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant/30 accent-primary"
            />
            <span className="text-[13px] text-on-surface">Enable auto-reply outside business hours</span>
          </label>

          {autoReplyEnabled && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant">
                Auto-Reply Message
              </label>
              <textarea
                value={autoReplyMessage}
                onChange={(e) => setAutoReplyMessage(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Enter your auto-reply message..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving…" : "Save Working Hours"}
        </button>
        {updateMutation.isSuccess && (
          <span className="text-[12px] text-success flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Feature Flags Section ──────────────────────

function FeatureFlagsSection() {
  const { data, isLoading } = useFeatureFlags();
  const updateMutation = useUpdateFeatureFlags();

  const [flags, setFlags] = useState<FeatureFlagsType>({
    campaigns: true,
    automation: true,
    analytics: true,
    scheduler: true,
    billing: true,
  });

  useEffect(() => {
    if (data) setFlags(data);
  }, [data]);

  const toggleFlag = (key: keyof FeatureFlagsType) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    updateMutation.mutate({ [key]: updated[key] });
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  const FLAG_LABELS: Record<keyof FeatureFlagsType, { label: string; description: string }> = {
    campaigns: {
      label: "Campaigns",
      description: "Enable campaign management and bulk messaging",
    },
    automation: {
      label: "Automation",
      description: "Enable automation rules and triggers",
    },
    analytics: {
      label: "Analytics",
      description: "Enable analytics dashboard and reporting",
    },
    scheduler: {
      label: "Scheduler",
      description: "Enable scheduled message sending",
    },
    billing: {
      label: "Billing",
      description: "Enable billing and subscription features",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ToggleLeft className="h-5 w-5" />
          Feature Flags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {(Object.keys(FLAG_LABELS) as Array<keyof FeatureFlagsType>).map(
          (key) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0"
            >
              <div>
                <p className="text-[13px] font-medium text-on-surface">
                  {FLAG_LABELS[key].label}
                </p>
                <p className="text-[11px] text-on-surface-variant/60">
                  {FLAG_LABELS[key].description}
                </p>
              </div>
              <button
                onClick={() => toggleFlag(key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  flags[key] ? "bg-primary" : "bg-outline-variant/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    flags[key] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          ),
        )}
        {updateMutation.isSuccess && (
          <p className="text-[12px] text-primary pt-2">Updated!</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── AI Settings Section ──────────────────────

function AiSettingsSection() {
  const [aiPurchaseIntent, setAiPurchaseIntent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current setting
  useEffect(() => {
    import("@/lib/api/client").then(({ default: apiClient }) => {
      apiClient
        .get("/settings/config/resolve", {
          params: { category: "ai", key: "auto_detect_purchase_intent" },
        })
        .then((r) => {
          setAiPurchaseIntent(r.data?.value === "true");
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const togglePurchaseIntent = async () => {
    const newValue = !aiPurchaseIntent;
    setAiPurchaseIntent(newValue);
    try {
      const { default: apiClient } = await import("@/lib/api/client");
      await apiClient.post("/settings/config", {
        category: "ai",
        key: "auto_detect_purchase_intent",
        value: String(newValue),
        type: "BOOLEAN",
        scope: "ORG",
      });
    } catch {
      setAiPurchaseIntent(!newValue); // revert on error
    }
  };

  if (loading) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5" />
          AI Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-[13px] font-medium text-on-surface">
              Auto-Detect Purchase Intent
            </p>
            <p className="text-[11px] text-on-surface-variant/60">
              AI analyzes incoming messages and auto-creates deals when customers
              show buying intent (e.g., "I want to buy", "send me pricing")
            </p>
          </div>
          <button
            onClick={togglePurchaseIntent}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              aiPurchaseIntent ? "bg-primary" : "bg-outline-variant/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                aiPurchaseIntent ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Notifications Section ──────────────────────

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { label: string; description: string }> = {
  MESSAGE_RECEIVED: { label: "Messages", description: "New incoming messages" },
  CONTACT_ASSIGNED: { label: "Contact Assigned", description: "When a contact is assigned to you" },
  CONTACT_REASSIGNED: { label: "Contact Reassigned", description: "When a contact is reassigned" },
  CAMPAIGN_COMPLETED: { label: "Campaign Completed", description: "Campaign finish notifications" },
  CAMPAIGN_FAILED: { label: "Campaign Failed", description: "Campaign failure alerts" },
  AUTOMATION_EXECUTED: { label: "Automation Executed", description: "Slow automation warnings" },
  AUTOMATION_FAILED: { label: "Automation Failed", description: "Automation failure alerts" },
  WHATSAPP_SESSION_DISCONNECTED: { label: "Session Disconnected", description: "WhatsApp session disconnects" },
  PAYMENT_FAILED: { label: "Payment Failed", description: "Payment failure alerts" },
  USAGE_LIMIT_WARNING: { label: "Usage Warning", description: "Approaching plan limits" },
  USAGE_LIMIT_REACHED: { label: "Usage Limit Reached", description: "Plan limit reached alerts" },
  SUBSCRIPTION_EXPIRING: { label: "Subscription Expiring", description: "Subscription expiry warnings" },
  SYSTEM_ALERT: { label: "System Alerts", description: "System-wide notifications" },
};

const ALL_NOTIFICATION_TYPES: NotificationType[] = Object.keys(
  NOTIFICATION_TYPE_LABELS,
) as NotificationType[];

function NotificationsSection() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreference();

  // Build a map from the preferences array for quick lookup
  const prefsMap = (preferences ?? []).reduce(
    (acc, pref) => {
      acc[pref.notificationType] = pref;
      return acc;
    },
    {} as Record<string, NotificationPreference>,
  );

  const getInApp = (type: NotificationType) =>
    prefsMap[type]?.inAppEnabled ?? true;
  const getEmail = (type: NotificationType) =>
    prefsMap[type]?.emailEnabled ?? false;

  const togglePref = (
    type: NotificationType,
    channel: "inAppEnabled" | "emailEnabled",
  ) => {
    const current =
      channel === "inAppEnabled" ? getInApp(type) : getEmail(type);
    updateMutation.mutate({
      notificationType: type,
      [channel]: !current,
    });
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[12px] text-on-surface-variant/60 mb-4">
          Choose which notifications you receive and how they are delivered.
        </p>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container/40 border-b border-outline-variant/15">
              <th className="py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Notification Type
              </th>
              <th className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                In-App
              </th>
              <th className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {ALL_NOTIFICATION_TYPES.map((type) => {
              const meta = NOTIFICATION_TYPE_LABELS[type];
              return (
                <tr
                  key={type}
                  className="border-b border-outline-variant/10 last:border-0"
                >
                  <td className="py-3">
                    <p className="text-[13px] text-on-surface">{meta.label}</p>
                    <p className="text-[11px] text-on-surface-variant/50">
                      {meta.description}
                    </p>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => togglePref(type, "inAppEnabled")}
                      className={`relative rounded-full transition-colors inline-block ${
                        getInApp(type) ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                      style={{ width: 40, height: 22 }}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                          getInApp(type) ? "translate-x-[18px]" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => togglePref(type, "emailEnabled")}
                      className={`relative rounded-full transition-colors inline-block ${
                        getEmail(type) ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                      style={{ width: 40, height: 22 }}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                          getEmail(type) ? "translate-x-[18px]" : ""
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {updateMutation.isSuccess && (
          <p className="text-[12px] text-primary pt-3">Preferences updated!</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Integrations Section (EPIC 12) ──────────────

const PROVIDER_META: Record<
  IntegrationProvider,
  { label: string; description: string; icon: string; fields: string[] }
> = {
  SMTP: {
    label: "SMTP",
    description: "Custom email server for transactional emails",
    icon: "📧",
    fields: ["host", "port", "username", "password"],
  },
  SENDGRID: {
    label: "SendGrid",
    description: "Email delivery service via API",
    icon: "📨",
    fields: ["apiKey"],
  },
  STRIPE: {
    label: "Stripe",
    description: "Payment processing and billing",
    icon: "💳",
    fields: ["secretKey"],
  },
  RAZORPAY: {
    label: "Razorpay",
    description: "Payment gateway for emerging markets",
    icon: "💰",
    fields: ["keyId", "keySecret"],
  },
};

function IntegrationsSection() {
  const { data: integrations, isLoading } = useIntegrations();
  const createMutation = useCreateIntegration();
  const deleteMutation = useDeleteIntegration();
  const testMutation = useTestIntegration();

  const [showForm, setShowForm] = useState(false);
  const [formProvider, setFormProvider] = useState<IntegrationProvider>("SMTP");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});

  const configuredProviders = new Set(
    (integrations ?? []).map((i) => i.provider),
  );

  const handleCreate = () => {
    if (!formDisplayName) return;
    const meta = PROVIDER_META[formProvider];
    const missingField = meta.fields.some((f) => !formCredentials[f]);
    if (missingField) return;

    createMutation.mutate(
      {
        provider: formProvider,
        displayName: formDisplayName,
        credentials: formCredentials,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setFormDisplayName("");
          setFormCredentials({});
        },
      },
    );
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="h-5 w-5" />
              Integrations
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(integrations ?? []).length === 0 && !showForm ? (
            <div className="text-center py-8">
              <Plug className="h-10 w-10 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-[13px] text-on-surface-variant">
                No integrations configured
              </p>
              <p className="text-[11px] text-on-surface-variant/60 mt-1">
                Connect external services like email providers and payment gateways
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(integrations ?? []).map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onTest={() => testMutation.mutate(integration.id)}
                  onDelete={() => deleteMutation.mutate(integration.id)}
                  isTesting={
                    testMutation.isPending &&
                    testMutation.variables === integration.id
                  }
                  testResult={
                    testMutation.isSuccess &&
                    testMutation.variables === integration.id
                      ? testMutation.data
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Integration</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 text-on-surface-variant" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Provider
              </label>
              <select
                value={formProvider}
                onChange={(e) => {
                  setFormProvider(e.target.value as IntegrationProvider);
                  setFormCredentials({});
                }}
                className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {(
                  Object.keys(PROVIDER_META) as IntegrationProvider[]
                ).map((p) => (
                  <option
                    key={p}
                    value={p}
                    disabled={configuredProviders.has(p)}
                  >
                    {PROVIDER_META[p].label}
                    {configuredProviders.has(p) ? " (already configured)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                placeholder={`My ${PROVIDER_META[formProvider].label}`}
                className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Credential Fields */}
            {PROVIDER_META[formProvider].fields.map((field) => (
              <div key={field} className="space-y-1.5">
                <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                  {field}
                </label>
                <input
                  type={
                    field.toLowerCase().includes("password") ||
                    field.toLowerCase().includes("secret") ||
                    field.toLowerCase().includes("key")
                      ? "password"
                      : "text"
                  }
                  value={formCredentials[field] ?? ""}
                  onChange={(e) =>
                    setFormCredentials((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  placeholder={field}
                  className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Integration"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  onTest,
  onDelete,
  isTesting,
  testResult,
}: {
  integration: IntegrationConfig;
  onTest: () => void;
  onDelete: () => void;
  isTesting: boolean;
  testResult?: { success: boolean; error?: string };
}) {
  const meta = PROVIDER_META[integration.provider];

  const statusColor =
    integration.status === "ACTIVE"
      ? "bg-primary"
      : integration.status === "ERROR"
        ? "bg-error"
        : "bg-outline-variant/40";

  const statusLabel =
    integration.status === "ACTIVE"
      ? "Active"
      : integration.status === "ERROR"
        ? "Error"
        : "Inactive";

  return (
    <div className="px-4 py-3 rounded-lg bg-surface-container/30 border border-outline-variant/10">
      <div className="flex items-center gap-3">
        <span className="text-xl">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-medium text-on-surface">
              {integration.displayName}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                integration.status === "ACTIVE"
                  ? "bg-primary/10 text-primary"
                  : integration.status === "ERROR"
                    ? "bg-error/10 text-error"
                    : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              {statusLabel}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant/60">
            {meta.label} &middot;{" "}
            {integration.credentialsSet
              ? "Credentials configured"
              : "No credentials"}
          </p>
          {integration.lastError && (
            <p className="text-[11px] text-error/80 mt-0.5 truncate">
              {integration.lastError}
            </p>
          )}
          {testResult && (
            <p
              className={`text-[11px] mt-0.5 ${testResult.success ? "text-primary" : "text-error/80"}`}
            >
              {testResult.success
                ? "Connection test passed!"
                : `Test failed: ${testResult.error}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTest}
            disabled={isTesting}
            title="Test Connection"
          >
            {isTesting ? (
              <Spinner size="sm" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-error hover:text-error"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Webhooks Section (EPIC 12 Enhanced) ─────────

const WEBHOOK_EVENTS = [
  "MESSAGE_RECEIVED",
  "MESSAGE_SENT",
  "MESSAGE_DELIVERED",
  "MESSAGE_FAILED",
  "CONTACT_CREATED",
  "CONTACT_UPDATED",
  "CAMPAIGN_COMPLETED",
  "CAMPAIGN_FAILED",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "SUBSCRIPTION_CHANGED",
] as const;

function WebhooksSection() {
  const { data, isLoading } = useWebhooks();
  const createMutation = useCreateWebhook();
  const deleteMutation = useDeleteWebhook();

  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newUrl || newEvents.length === 0) return;
    createMutation.mutate(
      {
        url: newUrl,
        events: newEvents as (typeof WEBHOOK_EVENT_TYPES)[number][],
        description: newDescription || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setNewUrl("");
          setNewDescription("");
          setNewEvents([]);
        },
      },
    );
  };

  const toggleEvent = (event: string) => {
    setNewEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event],
    );
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  const webhooks = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-5 w-5" />
              Webhooks
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 && !showForm ? (
            <div className="text-center py-8">
              <Webhook className="h-10 w-10 text-on-surface-variant/40 mx-auto mb-3" />
              <p className="text-[13px] text-on-surface-variant">
                No webhooks configured
              </p>
              <p className="text-[11px] text-on-surface-variant/60 mt-1">
                Add a webhook to receive real-time event notifications
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <WebhookCard
                  key={wh.id}
                  webhook={wh}
                  expanded={expandedWebhook === wh.id}
                  onToggleExpand={() =>
                    setExpandedWebhook(
                      expandedWebhook === wh.id ? null : wh.id,
                    )
                  }
                  onDelete={() => deleteMutation.mutate(wh.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Webhook</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 text-on-surface-variant" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Endpoint URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Description (optional)
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. Production event forwarder"
                className="w-full h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
                Events
              </label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                      newEvents.includes(event)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/50"
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  !newUrl ||
                  newEvents.length === 0
                }
              >
                {createMutation.isPending ? "Creating..." : "Create Webhook"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WebhookCard({
  webhook,
  expanded,
  onToggleExpand,
  onDelete,
}: {
  webhook: WebhookType;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}) {
  const updateMutation = useUpdateWebhook();
  const testMutation = useTestWebhook();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDisabled = !webhook.enabled;
  const isAutoDisabled = !!webhook.disabledAt;

  const handleToggleEnabled = () => {
    updateMutation.mutate({
      webhookId: webhook.id,
      enabled: !webhook.enabled,
      version: webhook.version,
    });
  };

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(webhook.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-surface-container/30 border border-outline-variant/10 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            webhook.enabled ? "bg-primary" : "bg-outline-variant/40"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-on-surface font-mono truncate">
              {webhook.url}
            </p>
            {isAutoDisabled && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-error/10 text-error text-[10px] font-medium shrink-0">
                <AlertTriangle className="h-3 w-3" />
                Auto-disabled
              </span>
            )}
          </div>
          {webhook.description && (
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              {webhook.description}
            </p>
          )}
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {webhook.events.map((ev) => (
              <span
                key={ev}
                className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant"
              >
                {ev}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => testMutation.mutate(webhook.id)}
            disabled={testMutation.isPending}
            title="Send Test"
          >
            {testMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          <button
            onClick={handleToggleEnabled}
            disabled={updateMutation.isPending}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              webhook.enabled ? "bg-primary" : "bg-outline-variant/30"
            }`}
            title={webhook.enabled ? "Disable" : "Enable"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                webhook.enabled ? "translate-x-4" : ""
              }`}
            />
          </button>
          <button onClick={onToggleExpand}>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-on-surface-variant" />
            ) : (
              <ChevronDown className="h-4 w-4 text-on-surface-variant" />
            )}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-error hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Test result feedback */}
      {testMutation.isSuccess && (
        <div className="px-4 pb-2">
          <p className="text-[11px] text-primary">
            Test delivery queued (ID: {testMutation.data.deliveryId})
          </p>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-outline-variant/10 px-4 py-3 space-y-4">
          {/* Signing Secret */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
              Signing Secret
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[12px] font-mono bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-on-surface">
                {showSecret ? webhook.secret : "whsec_••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                title={showSecret ? "Hide" : "Reveal"}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4 text-on-surface-variant" />
                ) : (
                  <Eye className="h-4 w-4 text-on-surface-variant" />
                )}
              </button>
              <button onClick={handleCopySecret} title="Copy">
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-on-surface-variant" />
                )}
              </button>
            </div>
          </div>

          {/* Config details */}
          <div className="grid grid-cols-3 gap-4 text-[12px]">
            <div>
              <p className="text-on-surface-variant/60 uppercase tracking-wider text-[10px]">
                Max Retries
              </p>
              <p className="text-on-surface font-medium">{webhook.maxRetries}</p>
            </div>
            <div>
              <p className="text-on-surface-variant/60 uppercase tracking-wider text-[10px]">
                Timeout
              </p>
              <p className="text-on-surface font-medium">
                {webhook.timeoutMs}ms
              </p>
            </div>
            <div>
              <p className="text-on-surface-variant/60 uppercase tracking-wider text-[10px]">
                Failure Count
              </p>
              <p
                className={`font-medium ${webhook.failureCount > 0 ? "text-error" : "text-on-surface"}`}
              >
                {webhook.failureCount}
              </p>
            </div>
          </div>

          {/* Delivery Logs */}
          <WebhookDeliveryLogs webhookId={webhook.id} />
        </div>
      )}
    </div>
  );
}

function WebhookDeliveryLogs({ webhookId }: { webhookId: string }) {
  const { data, isLoading } = useWebhookDeliveries(webhookId, { limit: 10 });

  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <Spinner size="sm" className="text-primary" />
      </div>
    );
  }

  const deliveries = data?.data ?? [];

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-[11px] text-on-surface-variant/60">
          No deliveries yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
        Recent Deliveries
      </p>
      <div className="space-y-1">
        {deliveries.map((d) => (
          <DeliveryRow key={d.id} delivery={d} />
        ))}
      </div>
      {(data?.total ?? 0) > 10 && (
        <p className="text-[11px] text-on-surface-variant/60 text-center pt-1">
          Showing 10 of {data?.total} deliveries
        </p>
      )}
    </div>
  );
}

function DeliveryRow({ delivery }: { delivery: WebhookDelivery }) {
  const statusConfig: Record<
    WebhookDeliveryStatus,
    { icon: typeof CheckCircle2; color: string; label: string }
  > = {
    SUCCESS: {
      icon: CheckCircle2,
      color: "text-primary",
      label: "Success",
    },
    FAILED: {
      icon: XCircle,
      color: "text-error",
      label: "Failed",
    },
    RETRYING: {
      icon: RotateCw,
      color: "text-warning",
      label: "Retrying",
    },
    PENDING: {
      icon: Clock,
      color: "text-on-surface-variant",
      label: "Pending",
    },
  };

  const config = statusConfig[delivery.status];
  const StatusIcon = config.icon;
  const timestamp = new Date(delivery.createdAt).toLocaleString();

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container-lowest/50 text-[12px]">
      <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${config.color}`} />
      <span className="text-on-surface-variant font-mono shrink-0">
        {delivery.eventType}
      </span>
      {delivery.httpStatus && (
        <span
          className={`shrink-0 ${
            delivery.httpStatus >= 200 && delivery.httpStatus < 300
              ? "text-primary"
              : "text-error"
          }`}
        >
          {delivery.httpStatus}
        </span>
      )}
      {delivery.duration !== null && (
        <span className="text-on-surface-variant/50 shrink-0">
          {delivery.duration}ms
        </span>
      )}
      {delivery.error && (
        <span className="text-error/70 truncate min-w-0">
          {delivery.error}
        </span>
      )}
      <span className="text-on-surface-variant/40 ml-auto shrink-0">
        {timestamp}
      </span>
    </div>
  );
}

// ─── Developer API Section ──────────────────────

function DeveloperApiSection() {
  const { data: stats, isLoading: statsLoading } = useDeveloperDashboard();
  const { data: keys, isLoading: keysLoading } = useApiKeys();
  const { data: logs } = useDeveloperLogs(10);
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const rotateKey = useRotateApiKey();

  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["read", "write", "messages"]);
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [createdKey, setCreatedKey] = useState<DeveloperApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "keys" | "docs" | "logs">("overview");
  const [keyConfirm, setKeyConfirm] = useState<{ type: "rotate" | "revoke"; id: string; name: string } | null>(null);

  const AVAILABLE_SCOPES = ["read", "write", "contacts", "messages", "campaigns"];

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    const result = await createKey.mutateAsync({
      name: newKeyName.trim(),
      scopes: newKeyScopes,
      expiresInDays: newKeyExpiry ? Number(newKeyExpiry) : undefined,
    });
    setCreatedKey(result);
    setNewKeyName("");
    setNewKeyExpiry("");
    setShowCreateKey(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const usagePercent = stats?.messagesLimit
    ? Math.min(100, Math.round((stats.messagesUsed / stats.messagesLimit) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-lg w-fit">
        {(
          [
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "keys", label: "API Keys", icon: Key },
            { id: "docs", label: "Quick Start", icon: FileCode },
            { id: "logs", label: "API Logs", icon: Activity },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              activeSubTab === tab.id
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {statsLoading ? (
            <SectionLoader />
          ) : stats ? (
            <>
              {/* Usage Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">Messages Used</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">
                      {stats.messagesUsed.toLocaleString()}
                      <span className="text-[13px] font-normal text-on-surface-variant">
                        {" / "}{stats.messagesLimit > 0 ? stats.messagesLimit.toLocaleString() : "∞"}
                      </span>
                    </p>
                    {stats.messagesLimit > 0 && (
                      <div className="mt-2 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercent > 90 ? "bg-error" : usagePercent > 70 ? "bg-warning" : "bg-primary"
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">Active Sessions</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">{stats.activeSessions}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">WhatsApp connected</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">API Keys</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">{stats.activeApiKeys}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">Active keys</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">Contacts</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">{stats.totalContacts.toLocaleString()}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">Total contacts</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[15px]">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button size="sm" onClick={() => setActiveSubTab("keys")}>
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setActiveSubTab("docs")}>
                    <FileCode className="h-4 w-4 mr-2" />
                    View API Docs
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setActiveSubTab("logs")}>
                    <Activity className="h-4 w-4 mr-2" />
                    View API Logs
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* ── API Keys ── */}
      {activeSubTab === "keys" && (
        <div className="space-y-4">
          {/* Created Key Banner */}
          {createdKey?.rawKey && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      New API Key — Copy it now, it will never be shown again!
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-[13px] bg-surface-container px-3 py-1.5 rounded-lg font-mono break-all">
                        {createdKey.rawKey}
                      </code>
                      <button
                        onClick={() => handleCopyKey(createdKey.rawKey!)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                        title="Copy"
                      >
                        {copiedKey ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setCreatedKey(null)} className="p-1 hover:bg-surface-container rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Key Form */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[15px]">API Keys</CardTitle>
              <Button size="sm" onClick={() => setShowCreateKey(!showCreateKey)}>
                <Plus className="h-4 w-4 mr-1" />
                New API Key
              </Button>
            </CardHeader>
            <CardContent>
              {showCreateKey && (
                <div className="mb-6 p-4 border border-outline-variant/20 rounded-xl space-y-4">
                  <div>
                    <label className="text-[12px] font-medium text-on-surface-variant">Key Name</label>
                    <input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-on-surface-variant">Scopes</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {AVAILABLE_SCOPES.map((scope) => (
                        <button
                          key={scope}
                          onClick={() =>
                            setNewKeyScopes((prev) =>
                              prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
                            )
                          }
                          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
                            newKeyScopes.includes(scope)
                              ? "bg-primary text-on-primary border-primary"
                              : "border-outline-variant/30 text-on-surface-variant hover:border-primary/50"
                          }`}
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-on-surface-variant">Expires In (days, optional)</label>
                    <input
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(e.target.value)}
                      type="number"
                      placeholder="Leave empty for no expiry"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleCreateKey} disabled={createKey.isPending || !newKeyName.trim()}>
                      {createKey.isPending ? <Spinner size="sm" className="mr-2" /> : null}
                      Create Key
                    </Button>
                  </div>
                </div>
              )}

              {/* Keys Table */}
              {keysLoading ? (
                <SectionLoader />
              ) : keys && keys.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="text-left text-on-surface-variant border-b border-outline-variant/15">
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Key</th>
                        <th className="pb-2 font-medium">Scopes</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Last Used</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key) => (
                        <tr key={key.id} className="border-b border-outline-variant/10">
                          <td className="py-3 font-medium text-on-surface">{key.name}</td>
                          <td className="py-3">
                            <code className="text-[12px] bg-surface-container px-2 py-0.5 rounded font-mono">
                              {key.keyPrefix}...
                            </code>
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {key.scopes.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 bg-surface-container rounded text-[11px]">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            {key.isActive ? (
                              <span className="flex items-center gap-1 text-primary text-[12px]">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-error text-[12px]">
                                <XCircle className="h-3.5 w-3.5" /> Revoked
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-on-surface-variant">
                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3">
                            {key.isActive && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setKeyConfirm({ type: "rotate", id: key.id, name: key.name })}
                                  disabled={rotateKey.isPending}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-colors disabled:opacity-40"
                                >
                                  <RotateCw className="h-3 w-3" />
                                  Rotate
                                </button>
                                <button
                                  onClick={() => setKeyConfirm({ type: "revoke", id: key.id, name: key.name })}
                                  disabled={revokeKey.isPending}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-on-surface-variant hover:text-error hover:bg-error/8 transition-colors disabled:opacity-40"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Revoke
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-on-surface-variant text-[13px]">
                  No API keys yet. Create one to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Quick Start / Docs ── */}
      {activeSubTab === "docs" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div>
                <h4 className="text-[13px] font-semibold text-on-surface mb-2">1. Get your API Key</h4>
                <p className="text-[13px] text-on-surface-variant mb-2">
                  Go to the &quot;API Keys&quot; tab above and create a new key. Copy it immediately — it&apos;s shown only once.
                </p>
              </div>

              {/* Step 2 */}
              <div>
                <h4 className="text-[13px] font-semibold text-on-surface mb-2">2. Connect WhatsApp</h4>
                <p className="text-[13px] text-on-surface-variant mb-2">
                  Go to Settings → WhatsApp and scan the QR code with your phone. Your session must be connected before sending messages.
                </p>
              </div>

              {/* Step 3 — Send a Message */}
              <div>
                <h4 className="text-[13px] font-semibold text-on-surface mb-2">3. Send a Message</h4>

                {/* cURL */}
                <p className="text-[12px] font-medium text-on-surface-variant mb-1">cURL</p>
                <pre className="bg-surface-container rounded-xl p-4 text-[12px] font-mono text-on-surface overflow-x-auto whitespace-pre">
{`curl -X POST \\
  ${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/v1/developer/messages/send \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "to": "+919876543210",
    "type": "text",
    "body": "Hello from CRM-WA API!"
  }'`}
                </pre>

                {/* Node.js */}
                <p className="text-[12px] font-medium text-on-surface-variant mt-4 mb-1">Node.js (axios)</p>
                <pre className="bg-surface-container rounded-xl p-4 text-[12px] font-mono text-on-surface overflow-x-auto whitespace-pre">
{`const axios = require("axios");

const res = await axios.post(
  "${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/v1/developer/messages/send",
  {
    to: "+919876543210",
    type: "text",
    body: "Hello from CRM-WA API!",
  },
  {
    headers: { "X-API-Key": "YOUR_API_KEY" },
  }
);

console.log(res.data);
// { message: { id: "...", to: "+91...", status: "QUEUED" } }`}
                </pre>

                {/* Python */}
                <p className="text-[12px] font-medium text-on-surface-variant mt-4 mb-1">Python (requests)</p>
                <pre className="bg-surface-container rounded-xl p-4 text-[12px] font-mono text-on-surface overflow-x-auto whitespace-pre">
{`import requests

res = requests.post(
    "${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/v1/developer/messages/send",
    json={
        "to": "+919876543210",
        "type": "text",
        "body": "Hello from CRM-WA API!",
    },
    headers={"X-API-Key": "YOUR_API_KEY"},
)

print(res.json())`}
                </pre>
              </div>

              {/* Step 4 — Webhooks */}
              <div>
                <h4 className="text-[13px] font-semibold text-on-surface mb-2">4. Receive Messages (Webhooks)</h4>
                <p className="text-[13px] text-on-surface-variant mb-2">
                  Register a webhook URL to receive incoming messages. Go to Settings → Webhooks and add your endpoint with the <code className="bg-surface-container px-1 rounded text-[12px]">message.received</code> event.
                </p>
                <pre className="bg-surface-container rounded-xl p-4 text-[12px] font-mono text-on-surface overflow-x-auto whitespace-pre">
{`// Webhook payload (POST to your URL):
{
  "event": "message.received",
  "payload": {
    "messageId": "uuid",
    "from": "+919876543210",
    "type": "text",
    "body": "Hi, I need help!",
    "timestamp": "2026-04-03T10:30:00Z"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* API Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">API Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant/15">
                      <th className="pb-2 font-medium">Method</th>
                      <th className="pb-2 font-medium">Endpoint</th>
                      <th className="pb-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px]">
                    {[
                      ["POST", "/developer/messages/send", "Send a WhatsApp message"],
                      ["GET", "/developer/messages", "List sent/received messages"],
                      ["GET", "/developer/messages/:id", "Get message status & events"],
                      ["GET", "/developer/contacts", "List contacts"],
                      ["POST", "/developer/contacts", "Create a contact"],
                      ["GET", "/developer/session/status", "Check WhatsApp connection"],
                      ["POST", "/developer/webhooks", "Register webhook URL"],
                      ["GET", "/developer/webhooks", "List webhooks"],
                      ["PUT", "/developer/webhooks/:id", "Update webhook"],
                      ["DELETE", "/developer/webhooks/:id", "Delete webhook"],
                    ].map(([method, path, desc]) => (
                      <tr key={`${method}-${path}`} className="border-b border-outline-variant/10">
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            method === "POST" ? "bg-primary/10 text-primary" :
                            method === "DELETE" ? "bg-error/10 text-error" :
                            method === "PUT" ? "bg-warning/10 text-warning" :
                            "bg-surface-container text-on-surface"
                          }`}>
                            {method}
                          </span>
                        </td>
                        <td className="py-2 text-on-surface">/api/v1{path}</td>
                        <td className="py-2 text-on-surface-variant font-sans">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[12px] text-on-surface-variant">
                All Developer API endpoints use <code className="bg-surface-container px-1 rounded">X-API-Key</code> header for authentication. No JWT required.
              </p>
            </CardContent>
          </Card>

          {/* Message Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">Supported Message Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">Text Message</p>
                  <pre className="mt-1 bg-surface-container rounded-xl p-3 text-[12px] font-mono text-on-surface overflow-x-auto">
{`{ "to": "+91...", "type": "text", "body": "Hello!" }`}
                  </pre>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">Image Message</p>
                  <pre className="mt-1 bg-surface-container rounded-xl p-3 text-[12px] font-mono text-on-surface overflow-x-auto">
{`{ "to": "+91...", "type": "image", "mediaUrl": "https://...", "caption": "Check this out" }`}
                  </pre>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">Interactive Buttons</p>
                  <pre className="mt-1 bg-surface-container rounded-xl p-3 text-[12px] font-mono text-on-surface overflow-x-auto">
{`{
  "to": "+91...",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": "Choose an option:",
    "buttons": [
      { "id": "buy", "title": "Buy Now" },
      { "id": "info", "title": "More Info" }
    ]
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── API Logs ── */}
      {activeSubTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[15px]">Recent API Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {logs?.data && logs.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant/15">
                      <th className="pb-2 font-medium">To</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Message</th>
                      <th className="pb-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.data.map((log) => (
                      <tr key={log.id} className="border-b border-outline-variant/10">
                        <td className="py-2.5 font-mono text-[12px]">{log.contactPhone}</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 bg-surface-container rounded text-[11px] uppercase">{log.type}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            log.status === "DELIVERED" || log.status === "READ" ? "bg-primary/10 text-primary" :
                            log.status === "SENT" ? "bg-primary/10 text-primary" :
                            log.status === "QUEUED" || log.status === "PROCESSING" ? "bg-warning/10 text-warning" :
                            log.status === "FAILED" ? "bg-error/10 text-error" : "bg-surface-container text-on-surface"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-on-surface-variant max-w-[200px] truncate">{log.body || "—"}</td>
                        <td className="py-2.5 text-on-surface-variant text-[12px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-on-surface-variant text-[13px]">
                No API activity yet. Send your first message using the API.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog for rotate/revoke */}
      <ConfirmDialog
        open={!!keyConfirm}
        title={keyConfirm?.type === "rotate" ? "Rotate API Key" : "Revoke API Key"}
        message={
          keyConfirm?.type === "rotate"
            ? `"${keyConfirm.name}" will be revoked and a new key generated. Copy the new key immediately — it won't be shown again.`
            : `"${keyConfirm?.name}" will be permanently disabled. Any integrations using this key will stop working immediately.`
        }
        confirmLabel={keyConfirm?.type === "rotate" ? "Rotate Key" : "Revoke Key"}
        variant={keyConfirm?.type === "revoke" ? "danger" : "warning"}
        loading={rotateKey.isPending || revokeKey.isPending}
        onCancel={() => setKeyConfirm(null)}
        onConfirm={() => {
          if (!keyConfirm) return;
          if (keyConfirm.type === "rotate") {
            rotateKey.mutate(keyConfirm.id, {
              onSuccess: (result) => {
                if (result) { setCreatedKey(result); setCopiedKey(false); setActiveSubTab("keys"); }
                setKeyConfirm(null);
              },
            });
          } else {
            revokeKey.mutate(keyConfirm.id, {
              onSuccess: () => setKeyConfirm(null),
            });
          }
        }}
      />
    </div>
  );
}

// ─── Loader ─────────────────────────────────────

function SectionLoader() {
  return (
    <Card>
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-primary" />
      </div>
    </Card>
  );
}

// ─── SLA Section ──────────────────────────────────
function SlaSection() {
  const { data: policies, isLoading } = useSlaPolicies();
  const createPolicy = useCreateSlaPolicy();
  const updatePolicy = useUpdateSlaPolicy();
  const deletePolicy = useDeleteSlaPolicy();

  const [showForm, setShowForm] = useState(false);
  const [editPolicy, setEditPolicy] = useState<SlaPolicy | null>(null);

  if (isLoading) return <SectionLoader />;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-on-surface flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            SLA Policies
          </h2>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Set response time targets. Agents get warned before breach.
          </p>
        </div>
        {!showForm && !editPolicy && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Policy
          </button>
        )}
      </div>

      {showForm && (
        <SlaPolicyForm
          onSubmit={(data) => createPolicy.mutate(data as any, { onSuccess: () => setShowForm(false) })}
          onCancel={() => setShowForm(false)}
          isSubmitting={createPolicy.isPending}
        />
      )}

      {editPolicy && (
        <SlaPolicyForm
          policy={editPolicy}
          onSubmit={(data) => updatePolicy.mutate({ id: editPolicy.id, data: data as any }, { onSuccess: () => setEditPolicy(null) })}
          onCancel={() => setEditPolicy(null)}
          isSubmitting={updatePolicy.isPending}
        />
      )}

      <SlaPolicyList
        policies={policies ?? []}
        onToggle={(id, isActive) => updatePolicy.mutate({ id, data: { isActive } })}
        onEdit={(p) => { setEditPolicy(p); setShowForm(false); }}
        onDelete={(id) => { if (confirm("Delete this SLA policy?")) deletePolicy.mutate(id); }}
        isUpdating={updatePolicy.isPending || deletePolicy.isPending}
      />

      {(policies?.length ?? 0) > 0 && (
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
          <p className="text-[12px] text-on-surface-variant">
            <strong className="text-on-surface">How it works:</strong> When a conversation starts,
            the timer begins. If no reply within the warning threshold, the agent gets alerted.
            Exceeding the breach threshold marks it as an SLA breach visible in SLA Tracking.
          </p>
        </div>
      )}
    </div>
  );
}
