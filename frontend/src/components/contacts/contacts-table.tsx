"use client";

import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadStatusBadge } from "./lead-status-badge";
import type { Contact } from "@/lib/types/contacts";

interface ContactsTableProps {
  contacts: Contact[];
  total: number;
  take: number;
  skip: number;
  isLoading: boolean;
  onRowClick: (id: string) => void;
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

export function ContactsTable({
  contacts,
  total,
  take,
  skip,
  isLoading,
  onRowClick,
  onPageChange,
  onCreateClick,
}: ContactsTableProps) {
  const currentPage = Math.floor(skip / take);
  const totalPages = Math.ceil(total / take);

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10"
          >
            <div className="h-9 w-9 rounded-full bg-surface-container animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-surface-container animate-pulse" />
              <div className="h-3 w-24 rounded bg-surface-container animate-pulse" />
            </div>
            <div className="h-5 w-16 rounded-full bg-surface-container animate-pulse" />
            <div className="h-3.5 w-24 rounded bg-surface-container animate-pulse" />
            <div className="h-5 w-12 rounded-full bg-surface-container animate-pulse" />
            <div className="h-3.5 w-16 rounded bg-surface-container animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No contacts found"
        description="Create your first contact or adjust your filters."
        actionLabel="Create Contact"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_120px_140px_80px_90px] gap-2 px-4 py-2.5 text-[11px] font-medium text-on-surface-variant uppercase tracking-wide border-b border-outline-variant/15">
        <span>Contact</span>
        <span>Status</span>
        <span>Owner</span>
        <span>Tags</span>
        <span>Source</span>
        <span>Created</span>
      </div>

      {/* Rows */}
      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onRowClick(contact.id)}
          className="w-full grid grid-cols-[1fr_100px_120px_140px_80px_90px] gap-2 items-center px-4 py-3 text-left border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          {/* Name + Phone */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={contact.name || contact.phoneNumber}
              src={contact.avatarUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-on-surface truncate">
                {contact.name || "Unknown"}
              </p>
              <p className="text-[11px] text-on-surface-variant/60 truncate">
                {contact.phoneNumber}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <LeadStatusBadge status={contact.leadStatus} />
          </div>

          {/* Owner */}
          <p className="text-[12px] text-on-surface-variant truncate">
            {contact.owner.firstName} {contact.owner.lastName}
          </p>

          {/* Tags */}
          <div className="flex gap-1 overflow-hidden">
            {contact.contactTags.slice(0, 2).map((ct) => (
              <Badge key={ct.id} variant="muted">
                {ct.tag.name}
              </Badge>
            ))}
            {contact.contactTags.length > 2 && (
              <span className="text-[11px] text-on-surface-variant/50">
                +{contact.contactTags.length - 2}
              </span>
            )}
          </div>

          {/* Source */}
          <Badge variant="default">{contact.source}</Badge>

          {/* Created */}
          <span className="text-[11px] text-on-surface-variant/60">
            {timeAgo(contact.createdAt)}
          </span>
        </button>
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
