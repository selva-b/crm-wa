"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthStore } from "@/stores/auth-store";
import {
  useOrgSettings,
  useWhatsAppConfig,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

type SettingsTab =
  | "organization"
  | "whatsapp"
  | "features"
  | "notifications"
  | "integrations"
  | "webhooks";

const TABS: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "features", label: "Feature Flags", icon: ToggleLeft },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
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

export default function SettingsPage() {
  usePageTitle("Settings");

  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-3" />
          <p className="text-[14px] text-on-surface-variant">
            You don&apos;t have permission to access settings.
          </p>
        </div>
      </div>
    );
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
          {activeTab === "features" && <FeatureFlagsSection />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "integrations" && <IntegrationsSection />}
          {activeTab === "webhooks" && <WebhooksSection />}
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
            <tr className="border-b border-outline-variant/15">
              <th className="py-2 text-left text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                Notification Type
              </th>
              <th className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
                In-App
              </th>
              <th className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
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
