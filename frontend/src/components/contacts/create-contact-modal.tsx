"use client";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateContact, useOrgMembers } from "@/hooks/use-contacts";
import {
  createContactSchema,
  type CreateContactFormData,
} from "@/lib/validations/contacts";

interface CreateContactModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateContactModal({ open, onClose }: CreateContactModalProps) {
  const createContact = useCreateContact();
  const { data: members } = useOrgMembers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { source: "MANUAL" },
  });

  function onSubmit(data: CreateContactFormData) {
    const payload = {
      ...data,
      email: data.email || undefined,
    };

    createContact.mutate(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-on-surface">
            New Contact
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              placeholder="+1234567890"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Contact name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <select
              id="source"
              {...register("source")}
              className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-[15px] text-on-surface outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40"
            >
              <option value="MANUAL">Manual</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="IMPORT">Import</option>
              <option value="API">API</option>
            </select>
          </div>

          <div>
            <Label htmlFor="ownerId">Assign To</Label>
            <select
              id="ownerId"
              {...register("ownerId")}
              className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-[15px] text-on-surface outline-none focus:bg-surface-container focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Me (default)</option>
              {(members ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>

          {createContact.isError && (
            <p className="text-[13px] text-error">
              {(createContact.error as Error)?.message ||
                "Failed to create contact"}
            </p>
          )}

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
              loading={createContact.isPending}
              className="flex-1"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
