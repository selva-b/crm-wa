"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAutomationRule } from "@/hooks/use-automation";
import {
  createAutomationRuleSchema,
  type CreateAutomationRuleFormData,
} from "@/lib/validations/automation";
import type {
  AutomationTriggerType,
  AutomationActionType,
} from "@/lib/types/automation";

interface CreateAutomationRuleModalProps {
  open: boolean;
  onClose: () => void;
}

const TRIGGER_TYPES: { value: AutomationTriggerType; label: string }[] = [
  { value: "MESSAGE_RECEIVED", label: "Message Received" },
  { value: "CONTACT_CREATED", label: "Contact Created" },
  { value: "LEAD_STATUS_CHANGED", label: "Lead Status Changed" },
  { value: "TIME_BASED", label: "Time-Based (Cron)" },
  { value: "NO_REPLY", label: "No Reply Follow-Up" },
];

const ACTION_TYPES: { value: AutomationActionType; label: string }[] = [
  { value: "SEND_MESSAGE", label: "Send Message" },
  { value: "ASSIGN_CONTACT", label: "Assign Contact" },
  { value: "ADD_TAG", label: "Add Tag" },
  { value: "UPDATE_STATUS", label: "Update Status" },
];

export function CreateAutomationRuleModal({
  open,
  onClose,
}: CreateAutomationRuleModalProps) {
  const createRule = useCreateAutomationRule();

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateAutomationRuleFormData>({
    resolver: zodResolver(createAutomationRuleSchema),
    defaultValues: {
      triggerType: "MESSAGE_RECEIVED",
      triggerConfig: {},
      actions: [
        { actionType: "SEND_MESSAGE", actionConfig: {}, orderIndex: 0 },
      ],
    },
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({ control, name: "actions" });

  const triggerType = watch("triggerType") as AutomationTriggerType;

  function onSubmit(data: CreateAutomationRuleFormData) {
    createRule.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] bg-surface-container rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15 shrink-0">
          <h2 className="text-[16px] font-semibold text-on-surface">
            Create Automation Rule
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          {/* Rule Name */}
          <div>
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g. Welcome new contacts"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Optional description..."
              {...register("description")}
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-[14px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Trigger Type */}
          <div>
            <Label htmlFor="triggerType">Trigger Type</Label>
            <select
              id="triggerType"
              {...register("triggerType")}
              className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Config — contextual fields */}
          <div className="rounded-xl border border-outline-variant/15 p-4 space-y-3">
            <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">
              Trigger Configuration
            </p>

            {triggerType === "MESSAGE_RECEIVED" && (
              <div>
                <Label htmlFor="triggerConfig.messageKeyword">Keyword</Label>
                <Input
                  id="triggerConfig.messageKeyword"
                  placeholder='e.g. "hello" (leave empty to match all messages)'
                  {...register("triggerConfig.messageKeyword")}
                />
              </div>
            )}

            {triggerType === "LEAD_STATUS_CHANGED" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="triggerConfig.fromStatus">From Status</Label>
                  <Input
                    id="triggerConfig.fromStatus"
                    placeholder="e.g. NEW"
                    {...register("triggerConfig.fromStatus")}
                  />
                </div>
                <div>
                  <Label htmlFor="triggerConfig.toStatus">To Status</Label>
                  <Input
                    id="triggerConfig.toStatus"
                    placeholder="e.g. QUALIFIED"
                    {...register("triggerConfig.toStatus")}
                  />
                </div>
              </div>
            )}

            {triggerType === "TIME_BASED" && (
              <div>
                <Label htmlFor="triggerConfig.cronExpression">
                  Cron Expression
                </Label>
                <Input
                  id="triggerConfig.cronExpression"
                  placeholder="e.g. 0 9 * * 1 (every Monday at 9AM)"
                  {...register("triggerConfig.cronExpression")}
                />
              </div>
            )}

            {triggerType === "NO_REPLY" && (
              <div>
                <Label htmlFor="triggerConfig.delaySeconds">
                  Delay (seconds)
                </Label>
                <Input
                  id="triggerConfig.delaySeconds"
                  type="number"
                  placeholder="e.g. 3600 (1 hour)"
                  {...register("triggerConfig.delaySeconds", { valueAsNumber: true })}
                />
              </div>
            )}

            {triggerType === "CONTACT_CREATED" && (
              <p className="text-[12px] text-on-surface-variant/60">
                Triggers when any new contact is created.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">
                Actions ({actionFields.length})
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  appendAction({
                    actionType: "SEND_MESSAGE",
                    actionConfig: {},
                    orderIndex: actionFields.length,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Action
              </Button>
            </div>

            {actionFields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-outline-variant/15 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-on-surface-variant">
                    Action {idx + 1}
                  </span>
                  {actionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(idx)}
                      className="p-1 rounded text-on-surface-variant/40 hover:text-error transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <Label>Action Type</Label>
                  <select
                    {...register(`actions.${idx}.actionType`)}
                    className="mt-1 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ACTION_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Delay (seconds)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register(`actions.${idx}.delaySeconds`, { valueAsNumber: true })}
                  />
                </div>
              </div>
            ))}

            {errors.actions?.message && (
              <p className="text-[12px] text-error">{errors.actions.message}</p>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="rounded-xl border border-outline-variant/15 p-4 space-y-3">
            <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">
              Advanced Settings
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  {...register("priority", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="maxExecutionsPerContact">
                  Max Exec / Contact
                </Label>
                <Input
                  id="maxExecutionsPerContact"
                  type="number"
                  placeholder="0 (unlimited)"
                  {...register("maxExecutionsPerContact", { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="cooldownSeconds">Cooldown (s)</Label>
                <Input
                  id="cooldownSeconds"
                  type="number"
                  placeholder="0"
                  {...register("cooldownSeconds", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 pb-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createRule.isPending}>
              Create Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
