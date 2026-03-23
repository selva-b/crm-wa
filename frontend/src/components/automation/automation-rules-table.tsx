"use client";

import { Zap, MoreVertical, Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RuleStatusBadge } from "./rule-status-badge";
import { TriggerTypeLabel } from "./trigger-type-label";
import type { AutomationRule } from "@/lib/types/automation";

interface AutomationRulesTableProps {
  rules: AutomationRule[];
  total: number;
  take: number;
  skip: number;
  isLoading: boolean;
  onEnable: (id: string) => void;
  onDisable: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onCreateClick: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function AutomationRulesTable({
  rules,
  total,
  take,
  skip,
  isLoading,
  onEnable,
  onDisable,
  onDelete,
  onPageChange,
  onCreateClick,
}: AutomationRulesTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
            <div className="h-3.5 w-16 rounded bg-surface-container animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="h-12 w-12" />}
        title="No automation rules"
        description="Create your first automation rule to automate your WhatsApp workflows."
        actionLabel="New Rule"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_120px_80px_80px_80px_36px] gap-2 px-4 py-2.5 text-[11px] font-medium text-on-surface-variant uppercase tracking-wide border-b border-outline-variant/15">
        <span>Rule</span>
        <span>Status</span>
        <span>Trigger</span>
        <span>Actions</span>
        <span>Runs</span>
        <span>Created</span>
        <span />
      </div>

      {/* Rows */}
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="relative grid grid-cols-[1fr_80px_120px_80px_80px_80px_36px] gap-2 items-center px-4 py-3.5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
        >
          {/* Name + Description */}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-on-surface truncate">
              {rule.name}
            </p>
            {rule.description && (
              <p className="text-[11px] text-on-surface-variant/60 truncate">
                {rule.description}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <RuleStatusBadge status={rule.status} />
          </div>

          {/* Trigger */}
          <div>
            <TriggerTypeLabel triggerType={rule.triggerType} />
          </div>

          {/* Actions count */}
          <span className="text-[12px] text-on-surface-variant tabular-nums">
            {rule.actions.length} action{rule.actions.length !== 1 ? "s" : ""}
          </span>

          {/* Execution count */}
          <span className="text-[12px] text-on-surface-variant tabular-nums">
            {rule.executionCount.toLocaleString()}
          </span>

          {/* Created */}
          <span className="text-[11px] text-on-surface-variant/60">
            {timeAgo(rule.createdAt)}
          </span>

          {/* Actions menu */}
          <div
            className="flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() =>
                setOpenMenu(openMenu === rule.id ? null : rule.id)
              }
              className="p-1 rounded-lg text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {openMenu === rule.id && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(null)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl bg-surface-container-high shadow-lg border border-outline-variant/15 py-1">
                  {rule.status === "INACTIVE" ? (
                    <button
                      onClick={() => {
                        onEnable(rule.id);
                        setOpenMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Power className="h-3.5 w-3.5" />
                      Enable
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onDisable(rule.id);
                        setOpenMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <PowerOff className="h-3.5 w-3.5" />
                      Disable
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(rule.id);
                      setOpenMenu(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
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
