"use client";

import { X, Phone, Mail, Tag, StickyNote, UserCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ContactInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string | null;
  leadStatus: string;
  tags: string[];
  notes: string;
  assignedTo?: string;
}

interface ContactPanelProps {
  contact: ContactInfo;
  onClose: () => void;
}

const leadStatusVariant: Record<string, "success" | "warning" | "error" | "info" | "primary" | "muted"> = {
  new: "info",
  contacted: "primary",
  qualified: "success",
  negotiation: "warning",
  lost: "error",
  won: "success",
};

export function ContactPanel({ contact, onClose }: ContactPanelProps) {
  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/15">
        <span className="text-[14px] font-semibold text-on-surface">
          Contact Info
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <Avatar name={contact.name} src={contact.avatar} size="lg" />
          <h3 className="mt-3 text-[16px] font-semibold text-on-surface">
            {contact.name}
          </h3>
          <Badge
            variant={leadStatusVariant[contact.leadStatus] ?? "muted"}
            className="mt-1.5 capitalize"
          >
            {contact.leadStatus}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={contact.phone} />
          {contact.email && (
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={contact.email} />
          )}
          {contact.assignedTo && (
            <DetailRow icon={<UserCircle className="h-4 w-4" />} label="Owner" value={contact.assignedTo} />
          )}
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5 text-on-surface-variant" />
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote className="h-3.5 w-3.5 text-on-surface-variant" />
              <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide">
                Notes
              </span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {contact.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-on-surface-variant">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-on-surface-variant/60 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-[13px] text-on-surface truncate">{value}</p>
      </div>
    </div>
  );
}
