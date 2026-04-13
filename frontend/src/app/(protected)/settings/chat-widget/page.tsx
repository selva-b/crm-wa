"use client";

import { useState, useEffect } from "react";
import { Code, MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useWidgetConfig, useUpdateWidgetConfig } from "@/hooks/use-widget";
import { useAuthStore } from "@/stores/auth-store";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";

const POSITIONS = [
  { value: "bottom-right", label: "Bottom Right" },
  { value: "bottom-left", label: "Bottom Left" },
];

export default function ChatWidgetSettingsPage() {
  usePageTitle("Chat Widget");

  const { data: config, isLoading } = useWidgetConfig();
  const updateConfig = useUpdateWidgetConfig();
  const user = useAuthStore((s) => s.user);
  const orgSlug = user?.orgId || "";

  const [form, setForm] = useState({
    enabled: false,
    position: "bottom-right",
    primaryColor: "#6366f1",
    welcomeMessage: "Hi! How can we help you?",
    placeholder: "Type a message...",
    companyName: "",
    whatsappNumber: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        enabled: config.enabled,
        position: config.position || "bottom-right",
        primaryColor: config.primaryColor || "#6366f1",
        welcomeMessage: config.welcomeMessage || "Hi! How can we help you?",
        placeholder: config.placeholder || "Type a message...",
        companyName: config.companyName || "",
        whatsappNumber: config.whatsappNumber || "",
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(form);
  };

  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/widgets/${orgSlug}/embed.js" async></script>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Chat Widget
        </h1>
        <p className="text-[13px] text-on-surface-variant mt-0.5">
          Embed a chat widget on your website to connect visitors to WhatsApp
        </p>
      </div>

      {/* Enable toggle */}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-5">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-[14px] font-medium text-on-surface">Enable Widget</p>
            <p className="text-[12px] text-on-surface-variant">Show chat widget on your website</p>
          </div>
          <div
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors cursor-pointer",
              form.enabled ? "bg-primary" : "bg-surface-container-highest",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                form.enabled ? "translate-x-[22px]" : "translate-x-0.5",
              )}
            />
          </div>
        </label>
      </div>

      {/* Configuration */}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-5 space-y-4">
        <h3 className="text-[14px] font-semibold text-on-surface">Appearance</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wide">
              Company Name
            </label>
            <input
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="Your company name"
              className="w-full mt-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wide">
              Position
            </label>
            <select
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              className="w-full mt-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-[13px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wide">
              Primary Color
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                className="h-9 w-9 rounded-lg border border-outline-variant/30 cursor-pointer"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                className="flex-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-[13px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wide">
              WhatsApp Number
            </label>
            <input
              value={form.whatsappNumber}
              onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
              placeholder="+919876543210"
              className="w-full mt-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wide">
            Welcome Message
          </label>
          <textarea
            value={form.welcomeMessage}
            onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))}
            rows={2}
            maxLength={500}
            className="w-full mt-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Embed Code */}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="text-[14px] font-semibold text-on-surface">Embed Code</h3>
        </div>
        <p className="text-[12px] text-on-surface-variant">
          Add this script to your website's HTML, just before the closing &lt;/body&gt; tag.
        </p>
        <div className="relative">
          <pre className="rounded-xl bg-surface-container-highest p-3 text-[12px] text-on-surface overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={copyEmbed}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface hover:bg-surface-container transition-colors"
            title="Copy"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-on-surface-variant" />}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container p-5 space-y-3">
        <h3 className="text-[14px] font-semibold text-on-surface">Preview</h3>
        <div className="relative h-[200px] rounded-xl bg-surface-container-highest overflow-hidden">
          <div
            className="absolute bottom-4"
            style={{ [form.position.includes("right") ? "right" : "left"]: "16px" }}
          >
            {/* Mini preview popup */}
            <div className="w-[240px] rounded-xl bg-white shadow-lg overflow-hidden mb-2">
              <div className="px-4 py-3" style={{ background: form.primaryColor }}>
                <p className="text-white text-[12px] font-semibold">{form.companyName || "Chat"}</p>
                <p className="text-white/80 text-[11px] mt-0.5">{form.welcomeMessage}</p>
              </div>
              <div className="px-4 py-3">
                <div className="rounded-lg px-3 py-2 text-[11px] text-white font-medium text-center" style={{ background: "#25D366" }}>
                  Chat on WhatsApp
                </div>
              </div>
            </div>
            {/* Button preview */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: form.primaryColor,
                marginLeft: form.position.includes("right") ? "auto" : "0",
              }}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
