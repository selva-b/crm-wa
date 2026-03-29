"use client";

import { useState } from "react";
import type {
  SlaPolicy,
  CreateSlaPolicyRequest,
  UpdateSlaPolicyRequest,
  SlaMetricType,
  SlaPriority,
} from "@/lib/types/sla";

const METRIC_OPTIONS: { value: SlaMetricType; label: string }[] = [
  { value: "FIRST_RESPONSE_TIME", label: "First Response Time" },
  { value: "AVG_RESPONSE_TIME", label: "Avg Response Time" },
  { value: "RESOLUTION_TIME", label: "Resolution Time" },
];

const PRIORITY_OPTIONS: { value: SlaPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

interface SlaPolicyFormProps {
  policy?: SlaPolicy;
  onSubmit: (data: CreateSlaPolicyRequest | UpdateSlaPolicyRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SlaPolicyForm({
  policy,
  onSubmit,
  onCancel,
  isSubmitting,
}: SlaPolicyFormProps) {
  const [name, setName] = useState(policy?.name ?? "");
  const [description, setDescription] = useState(policy?.description ?? "");
  const [metricType, setMetricType] = useState<SlaMetricType>(
    policy?.metricType ?? "FIRST_RESPONSE_TIME",
  );
  const [priority, setPriority] = useState<SlaPriority>(
    policy?.priority ?? "NORMAL",
  );
  const [thresholdMinutes, setThresholdMinutes] = useState(
    policy ? Math.round(policy.thresholdMs / 60_000) : 5,
  );
  const [warningMinutes, setWarningMinutes] = useState(
    policy?.warningThresholdMs
      ? Math.round(policy.warningThresholdMs / 60_000)
      : 3,
  );
  const [hasWarning, setHasWarning] = useState(
    policy?.warningThresholdMs != null,
  );
  const [businessHoursOnly, setBusinessHoursOnly] = useState(
    policy?.businessHoursOnly ?? false,
  );
  const [businessStart, setBusinessStart] = useState(
    policy?.businessHoursStart ?? 9,
  );
  const [businessEnd, setBusinessEnd] = useState(
    policy?.businessHoursEnd ?? 17,
  );
  const [notifyOnBreach, setNotifyOnBreach] = useState(
    policy?.notifyOnBreach ?? true,
  );
  const [notifyOnWarning, setNotifyOnWarning] = useState(
    policy?.notifyOnWarning ?? true,
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (thresholdMinutes < 1) {
      setError("Threshold must be at least 1 minute");
      return;
    }

    if (hasWarning && warningMinutes >= thresholdMinutes) {
      setError("Warning threshold must be less than breach threshold");
      return;
    }

    const data: CreateSlaPolicyRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      metricType,
      priority,
      thresholdMs: thresholdMinutes * 60_000,
      warningThresholdMs: hasWarning ? warningMinutes * 60_000 : undefined,
      businessHoursOnly,
      ...(businessHoursOnly
        ? {
            businessHoursStart: businessStart,
            businessHoursEnd: businessEnd,
            businessDays: [1, 2, 3, 4, 5],
          }
        : {}),
      notifyOnBreach,
      notifyOnWarning,
    };

    onSubmit(data);
  };

  const inputCls =
    "w-full rounded-lg bg-surface-container border border-outline-variant/20 px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 transition-colors";
  const selectCls = inputCls;
  const labelCls = "block text-[12px] font-medium text-on-surface-variant mb-1";

  return (
    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-5">
      <h3 className="text-[15px] font-semibold text-on-surface mb-4">
        {policy ? "Edit SLA Policy" : "Create SLA Policy"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelCls}>Policy Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Critical Response SLA"
            className={inputCls}
            maxLength={255}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this SLA rule"
            className={inputCls}
            maxLength={1000}
          />
        </div>

        {/* Metric + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Metric Type</label>
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as SlaMetricType)}
              className={selectCls}
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SlaPriority)}
              className={selectCls}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Breach Threshold (minutes)</label>
            <input
              type="number"
              value={thresholdMinutes}
              onChange={(e) => setThresholdMinutes(Number(e.target.value))}
              min={1}
              max={10080}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-2">
                Warning Threshold (minutes)
                <input
                  type="checkbox"
                  checked={hasWarning}
                  onChange={(e) => setHasWarning(e.target.checked)}
                  className="rounded"
                />
              </span>
            </label>
            <input
              type="number"
              value={warningMinutes}
              onChange={(e) => setWarningMinutes(Number(e.target.value))}
              min={1}
              max={10080}
              disabled={!hasWarning}
              className={`${inputCls} ${!hasWarning ? "opacity-50" : ""}`}
            />
          </div>
        </div>

        {/* Business Hours */}
        <div>
          <label className="flex items-center gap-2 text-[12px] font-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={businessHoursOnly}
              onChange={(e) => setBusinessHoursOnly(e.target.checked)}
              className="rounded"
            />
            Business hours only (Mon–Fri)
          </label>
          {businessHoursOnly && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className={labelCls}>Start Hour</label>
                <input
                  type="number"
                  value={businessStart}
                  onChange={(e) => setBusinessStart(Number(e.target.value))}
                  min={0}
                  max={23}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>End Hour</label>
                <input
                  type="number"
                  value={businessEnd}
                  onChange={(e) => setBusinessEnd(Number(e.target.value))}
                  min={0}
                  max={23}
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[12px] font-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={notifyOnBreach}
              onChange={(e) => setNotifyOnBreach(e.target.checked)}
              className="rounded"
            />
            Notify on breach
          </label>
          <label className="flex items-center gap-2 text-[12px] font-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={notifyOnWarning}
              onChange={(e) => setNotifyOnWarning(e.target.checked)}
              className="rounded"
            />
            Notify on warning
          </label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[12px] text-error">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : policy
                ? "Update Policy"
                : "Create Policy"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-medium hover:bg-surface-container/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
