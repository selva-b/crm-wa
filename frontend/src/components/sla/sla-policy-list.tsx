"use client";

import { Shield, ToggleLeft, ToggleRight, Pencil, Trash2 } from "lucide-react";
import type { SlaPolicy } from "@/lib/types/sla";

function formatMs(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (hours < 24) return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const metricLabels: Record<string, string> = {
  FIRST_RESPONSE_TIME: "First Response Time",
  AVG_RESPONSE_TIME: "Avg Response Time",
  RESOLUTION_TIME: "Resolution Time",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-surface-container text-on-surface-variant",
  NORMAL: "bg-primary/10 text-primary",
  HIGH: "bg-warning/10 text-warning",
  CRITICAL: "bg-error/10 text-error",
};

interface SlaPolicyListProps {
  policies: SlaPolicy[];
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (policy: SlaPolicy) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function SlaPolicyList({
  policies,
  onToggle,
  onEdit,
  onDelete,
  isUpdating,
}: SlaPolicyListProps) {
  if (policies.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-8 text-center">
        <Shield className="h-10 w-10 text-on-surface-variant/30 mx-auto mb-3" />
        <p className="text-[13px] text-on-surface-variant/50">
          No SLA policies configured yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {policies.map((policy) => (
        <div
          key={policy.id}
          className={`rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-4 transition-opacity ${
            !policy.isActive ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[14px] font-medium text-on-surface truncate">
                  {policy.name}
                </h4>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    priorityStyles[policy.priority]
                  }`}
                >
                  {policy.priority}
                </span>
                {!policy.isActive && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant/50">
                    Disabled
                  </span>
                )}
              </div>

              {policy.description && (
                <p className="text-[12px] text-on-surface-variant/60 mb-2 line-clamp-1">
                  {policy.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-[11px] text-on-surface-variant/50">
                <span>{metricLabels[policy.metricType]}</span>
                <span>
                  Threshold: <strong className="text-on-surface">{formatMs(policy.thresholdMs)}</strong>
                </span>
                {policy.warningThresholdMs && (
                  <span>
                    Warning: <strong className="text-warning">{formatMs(policy.warningThresholdMs)}</strong>
                  </span>
                )}
                {policy.businessHoursOnly && (
                  <span className="text-primary">Business hours only</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onToggle(policy.id, !policy.isActive)}
                disabled={isUpdating}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                title={policy.isActive ? "Disable" : "Enable"}
              >
                {policy.isActive ? (
                  <ToggleRight className="h-5 w-5 text-success" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => onEdit(policy)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(policy.id)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
