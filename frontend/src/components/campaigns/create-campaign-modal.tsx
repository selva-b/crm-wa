"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCampaign, usePreviewAudience } from "@/hooks/use-campaigns";
import {
  createCampaignSchema,
  type CreateCampaignFormData,
} from "@/lib/validations/campaigns";
import type { MessageType, CampaignAudienceType } from "@/lib/types/campaigns";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  sessions: { id: string; name: string; status: string }[];
}

export function CreateCampaignModal({
  open,
  onClose,
  sessions,
}: CreateCampaignModalProps) {
  const createCampaign = useCreateCampaign();
  const previewAudience = usePreviewAudience();
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "scheduled">(
    "immediate",
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      messageType: "TEXT",
      audienceType: "ALL",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const messageType = watch("messageType") as MessageType;
  const audienceType = watch("audienceType") as CampaignAudienceType;
  const messageBody = watch("messageBody") || "";

  function onSubmit(data: CreateCampaignFormData) {
    const payload = {
      ...data,
      description: data.description || undefined,
      messageBody: data.messageBody || undefined,
      mediaUrl: data.mediaUrl || undefined,
      mediaMimeType: data.mediaMimeType || undefined,
      scheduledAt:
        scheduleMode === "scheduled" && data.scheduledAt
          ? data.scheduledAt
          : undefined,
    };

    createCampaign.mutate(payload, {
      onSuccess: () => {
        reset();
        setScheduleMode("immediate");
        onClose();
      },
    });
  }

  function handlePreviewAudience() {
    previewAudience.mutate({
      audienceType,
      audienceFilters: undefined,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-on-surface">
            New Campaign
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Campaign Details */}
          <section className="space-y-3">
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">
              Campaign Details
            </p>
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Offer 2024"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Brief description of this campaign..."
                rows={2}
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-[15px] text-on-surface outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-on-surface-variant/40"
                {...register("description")}
              />
            </div>
          </section>

          {/* Section 2: Message Content */}
          <section className="space-y-3">
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">
              Message Content
            </p>
            <div>
              <Label>Message Type</Label>
              <div className="flex gap-1.5">
                {(["TEXT", "IMAGE", "VIDEO", "DOCUMENT"] as MessageType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setValue("messageType", type, { shouldValidate: true })
                      }
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        messageType === type
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-transparent"
                      }`}
                    >
                      {type}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="messageBody">Message Body</Label>
              <textarea
                id="messageBody"
                placeholder="Type your message here... Use {{name}} for personalization"
                rows={4}
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-[15px] text-on-surface outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-on-surface-variant/40"
                {...register("messageBody")}
              />
              <div className="flex justify-between mt-1">
                <p className="text-[11px] text-on-surface-variant/50">
                  Supports: {"{{name}}"}, {"{{phone}}"}
                </p>
                <p className="text-[11px] text-on-surface-variant/50 tabular-nums">
                  {messageBody.length} / 4,096
                </p>
              </div>
              {errors.messageBody && (
                <p className="text-[12px] text-error mt-1">
                  {errors.messageBody.message}
                </p>
              )}
            </div>

            {messageType !== "TEXT" && (
              <div>
                <Label htmlFor="mediaUrl">Media URL *</Label>
                <Input
                  id="mediaUrl"
                  placeholder="https://example.com/image.jpg"
                  error={errors.mediaUrl?.message}
                  {...register("mediaUrl")}
                />
              </div>
            )}
          </section>

          {/* Section 3: Audience */}
          <section className="space-y-3">
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">
              Audience
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    value: "ALL",
                    title: "All Contacts",
                    desc: "Send to all active contacts",
                  },
                  {
                    value: "FILTERED",
                    title: "Filtered",
                    desc: "Target specific segments",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("audienceType", opt.value, { shouldValidate: true })
                  }
                  className={`p-3 rounded-xl text-left transition-colors border ${
                    audienceType === opt.value
                      ? "border-primary/50 bg-primary/5"
                      : "border-outline-variant/15 bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <p className="text-[13px] font-medium text-on-surface">
                    {opt.title}
                  </p>
                  <p className="text-[11px] text-on-surface-variant/60">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>

            {previewAudience.data && (
              <p className="text-[12px] text-on-surface-variant">
                Estimated recipients:{" "}
                <span className="font-medium text-on-surface">
                  {previewAudience.data.total.toLocaleString()}
                </span>
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreviewAudience}
              loading={previewAudience.isPending}
            >
              Preview Audience
            </Button>
          </section>

          {/* Section 4: WhatsApp Session */}
          <section className="space-y-3">
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">
              WhatsApp Session
            </p>
            <div>
              <Label htmlFor="sessionId">Session *</Label>
              <select
                id="sessionId"
                {...register("sessionId")}
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-[15px] text-on-surface outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Select a session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
              {errors.sessionId && (
                <p className="text-[12px] text-error mt-1">
                  {errors.sessionId.message}
                </p>
              )}
            </div>
          </section>

          {/* Section 5: Scheduling */}
          <section className="space-y-3">
            <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">
              Scheduling
            </p>
            <div className="flex gap-3">
              {(
                [
                  { value: "immediate", label: "Send immediately" },
                  { value: "scheduled", label: "Schedule for later" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScheduleMode(opt.value)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border ${
                    scheduleMode === opt.value
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {scheduleMode === "scheduled" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scheduledAt">Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    error={errors.scheduledAt?.message}
                    {...register("scheduledAt")}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    placeholder="UTC"
                    {...register("timezone")}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Error */}
          {createCampaign.isError && (
            <p className="text-[13px] text-error">
              {(createCampaign.error as Error)?.message ||
                "Failed to create campaign"}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createCampaign.isPending}
              className="flex-1"
            >
              Create Campaign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
