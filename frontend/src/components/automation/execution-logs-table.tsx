"use client";

import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ExecutionStatusBadge } from "./execution-status-badge";
import { TriggerTypeLabel } from "./trigger-type-label";
import type { AutomationExecutionLog } from "@/lib/types/automation";

interface ExecutionLogsTableProps {
  logs: AutomationExecutionLog[];
  total: number;
  take: number;
  skip: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionLogsTable({
  logs,
  total,
  take,
  skip,
  isLoading,
  onPageChange,
}: ExecutionLogsTableProps) {
  const currentPage = Math.floor(skip / take);
  const totalPages = Math.ceil(total / take);

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-outline-variant/10"
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-surface-container animate-pulse" />
              <div className="h-3 w-28 rounded bg-surface-container animate-pulse" />
            </div>
            <div className="h-5 w-16 rounded-full bg-surface-container animate-pulse" />
            <div className="h-3.5 w-24 rounded bg-surface-container animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText className="h-12 w-12" />}
        title="No execution logs"
        description="Logs will appear here once automation rules start executing."
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_80px_80px_140px_80px] gap-2 px-4 py-2.5 text-[11px] font-medium text-on-surface-variant uppercase tracking-wide border-b border-outline-variant/15">
        <span>Rule</span>
        <span>Trigger</span>
        <span>Status</span>
        <span>Duration</span>
        <span>Executed At</span>
        <span>Retries</span>
      </div>

      {/* Rows */}
      {logs.map((log) => (
        <div
          key={log.id}
          className="grid grid-cols-[1fr_120px_80px_80px_140px_80px] gap-2 items-center px-4 py-3.5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
        >
          {/* Rule name */}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-on-surface truncate">
              {log.rule.name}
            </p>
            {log.error && (
              <p className="text-[11px] text-error/80 truncate">{log.error}</p>
            )}
          </div>

          {/* Trigger type */}
          <div>
            <TriggerTypeLabel triggerType={log.rule.triggerType} />
          </div>

          {/* Status */}
          <div>
            <ExecutionStatusBadge status={log.status} />
          </div>

          {/* Duration */}
          <span className="text-[12px] text-on-surface-variant tabular-nums">
            {formatDuration(log.executionTimeMs)}
          </span>

          {/* Executed at */}
          <span className="text-[12px] text-on-surface-variant tabular-nums">
            {log.startedAt ? formatDate(log.startedAt) : formatDate(log.createdAt)}
          </span>

          {/* Retry count */}
          <span className="text-[12px] text-on-surface-variant tabular-nums">
            {log.retryCount}
          </span>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-[12px] text-on-surface-variant/60">
            {skip + 1}–{Math.min(skip + take, total)} of {total}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
