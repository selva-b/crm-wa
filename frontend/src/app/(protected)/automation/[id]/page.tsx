"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Power,
  PowerOff,
  Trash2,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { RuleStatusBadge } from "@/components/automation/rule-status-badge";
import { TriggerTypeLabel } from "@/components/automation/trigger-type-label";
import { ExecutionLogsTable } from "@/components/automation/execution-logs-table";
import {
  useAutomationRule,
  useExecutionLogs,
  useEnableAutomationRule,
  useDisableAutomationRule,
  useDeleteAutomationRule,
} from "@/hooks/use-automation";
import type { AutomationActionType } from "@/lib/types/automation";

const ACTION_LABELS: Record<AutomationActionType, string> = {
  SEND_MESSAGE: "Send WhatsApp Message",
  ASSIGN_CONTACT: "Assign Contact",
  ADD_TAG: "Add Tag",
  UPDATE_STATUS: "Update Status",
};

const TAKE = 20;

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function ConfigKeyValue({ config }: { config: Record<string, unknown> }) {
  const entries = Object.entries(config).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return <p className="text-[12px] text-on-surface-variant/50 italic">No config</p>;
  return (
    <dl className="space-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="flex gap-2 text-[12px]">
          <dt className="text-on-surface-variant font-medium capitalize min-w-[100px]">
            {k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
          </dt>
          <dd className="text-on-surface font-mono break-all">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AutomationRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [logsPage, setLogsPage] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: rule, isLoading, isError } = useAutomationRule(id);
  const { data: logsData, isLoading: logsLoading } = useExecutionLogs({
    ruleId: id,
    limit: TAKE,
    offset: logsPage * TAKE,
  });

  const enableRule = useEnableAutomationRule();
  const disableRule = useDisableAutomationRule();
  const deleteRule = useDeleteAutomationRule();

  function handleToggle() {
    if (!rule) return;
    if (rule.status === "ACTIVE") {
      disableRule.mutate(id);
    } else {
      enableRule.mutate(id);
    }
  }

  function handleDelete() {
    deleteRule.mutate(id, {
      onSuccess: () => router.push("/automation"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
        <div className="px-6 pt-5 pb-4 flex items-center gap-3 border-b border-outline-variant/10">
          <div className="h-8 w-8 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-5 w-48 rounded bg-surface-container-high animate-pulse" />
        </div>
        <div className="flex-1 px-6 py-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !rule) {
    return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height))] items-center justify-center">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-error" />}
          title="Rule not found"
          description="This automation rule does not exist or was deleted."
          actionLabel="Back to Automation"
          onAction={() => router.push("/automation")}
        />
      </div>
    );
  }

  const isToggling = enableRule.isPending || disableRule.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 flex items-center justify-between border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/automation")}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-on-surface-variant" />
            <h1 className="text-[16px] font-semibold text-on-surface">{rule.name}</h1>
            <RuleStatusBadge status={rule.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            loading={isToggling}
          >
            {rule.status === "ACTIVE" ? (
              <>
                <PowerOff className="h-4 w-4 mr-1.5" />
                Disable
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-1.5" />
                Enable
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-error hover:bg-error/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Overview card */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 space-y-1">
          {rule.description && (
            <p className="text-[13px] text-on-surface-variant mb-2">{rule.description}</p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-on-surface-variant">
            <span>Created: <span className="text-on-surface">{formatDate(rule.createdAt)}</span></span>
            <span>Priority: <span className="text-on-surface">{rule.priority}</span></span>
            <span>Cooldown: <span className="text-on-surface">{rule.cooldownSeconds}s</span></span>
            <span>Max runs/contact: <span className="text-on-surface">{rule.maxExecutionsPerContact}</span></span>
            <span>Total executions: <span className="text-on-surface">{rule.executionCount.toLocaleString()}</span></span>
            {rule.lastTriggeredAt && (
              <span>Last triggered: <span className="text-on-surface">{formatDate(rule.lastTriggeredAt)}</span></span>
            )}
          </div>
        </div>

        {/* Trigger card */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Trigger</h2>
          <div className="flex items-center gap-2 mb-3">
            <TriggerTypeLabel triggerType={rule.triggerType} />
          </div>
          <ConfigKeyValue config={rule.triggerConfig as Record<string, unknown>} />
        </div>

        {/* Actions card */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
            Actions ({rule.actions.length})
          </h2>
          {rule.actions.length === 0 ? (
            <p className="text-[12px] text-on-surface-variant/50 italic">No actions configured</p>
          ) : (
            <ol className="space-y-3">
              {rule.actions
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((action, i) => (
                  <li key={action.id} className="flex gap-3">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-on-surface">
                        {ACTION_LABELS[action.actionType] ?? action.actionType}
                      </p>
                      {action.delaySeconds > 0 && (
                        <p className="text-[11px] text-on-surface-variant/60 mb-1">
                          Delay: {action.delaySeconds}s
                        </p>
                      )}
                      <ConfigKeyValue config={action.actionConfig} />
                    </div>
                  </li>
                ))}
            </ol>
          )}
        </div>

        {/* Recent executions */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant/10">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Recent Executions
            </h2>
          </div>
          <ExecutionLogsTable
            logs={logsData?.data ?? []}
            total={logsData?.total ?? 0}
            take={TAKE}
            skip={logsPage * TAKE}
            isLoading={logsLoading}
            onPageChange={setLogsPage}
          />
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Automation Rule"
        message={`Are you sure you want to delete "${rule.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteRule.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
