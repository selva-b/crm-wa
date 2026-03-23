"use client";

import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Globe,
  Trash2,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { LeadStatusBadge } from "./lead-status-badge";
import { ContactTags } from "./contact-tags";
import { ContactNotes } from "./contact-notes";
import { ContactHistory } from "./contact-history";
import { AssignOwnerModal } from "./assign-owner-modal";
import {
  useContact,
  useChangeLeadStatus,
  useDeleteContact,
  useUpdateContact,
} from "@/hooks/use-contacts";
import type { LeadStatus } from "@/lib/types/contacts";

interface ContactDetailDrawerProps {
  contactId: string | null;
  open: boolean;
  onClose: () => void;
}

const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed" },
];

const drawerTabs = [
  { id: "info", label: "Info" },
  { id: "notes", label: "Notes" },
  { id: "history", label: "History" },
];

export function ContactDetailDrawer({
  contactId,
  open,
  onClose,
}: ContactDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [showActions, setShowActions] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const { data: contact, isLoading } = useContact(contactId);
  const changeStatus = useChangeLeadStatus();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();

  function handleStatusChange(status: LeadStatus) {
    if (!contactId || !contact || contact.leadStatus === status) return;
    changeStatus.mutate({ contactId, status });
  }

  function handleDelete() {
    if (!contactId) return;
    if (!confirm("Are you sure you want to delete this contact?")) return;
    deleteContact.mutate(contactId, { onSuccess: onClose });
  }

  function handleNameSave() {
    if (!contactId || !nameValue.trim()) return;
    updateContact.mutate(
      { contactId, name: nameValue.trim() },
      { onSuccess: () => setEditingName(false) },
    );
  }

  function startEditName() {
    setNameValue(contact?.name || "");
    setEditingName(true);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-surface/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-surface-container-lowest border-l border-outline-variant/15 shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <h2 className="text-[15px] font-semibold text-on-surface">
            Contact Details
          </h2>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-9 z-10 w-44 rounded-xl bg-surface-container-lowest border border-outline-variant/15 shadow-lg py-1">
                  <button
                    onClick={() => {
                      setShowAssign(true);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Assign Owner
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-surface-container transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Contact
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-57px)] overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {contact && (
            <div className="space-y-0">
              {/* Profile header */}
              <div className="px-5 py-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={contact.name || contact.phoneNumber}
                    src={contact.avatarUrl}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    {editingName ? (
                      <div className="flex gap-1.5">
                        <input
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleNameSave();
                            if (e.key === "Escape") setEditingName(false);
                          }}
                          autoFocus
                          className="flex-1 h-7 rounded-lg bg-surface-container-low px-2 text-[14px] text-on-surface outline-none focus:ring-1 focus:ring-primary/40"
                        />
                        <Button
                          size="sm"
                          onClick={handleNameSave}
                          loading={updateContact.isPending}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <p
                        className="text-[16px] font-semibold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={startEditName}
                        title="Click to edit name"
                      >
                        {contact.name || "Unknown"}
                      </p>
                    )}
                    <p className="text-[12px] text-on-surface-variant/60 mt-0.5">
                      {contact.owner.firstName} {contact.owner.lastName}
                    </p>
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {LEAD_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      disabled={changeStatus.isPending}
                      className={`transition-opacity ${
                        contact.leadStatus === s.value
                          ? "opacity-100"
                          : "opacity-40 hover:opacity-70"
                      }`}
                    >
                      <LeadStatusBadge status={s.value} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick info */}
              <div className="px-5 pb-4 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{contact.phoneNumber}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <Badge variant="default">{contact.source}</Badge>
                </div>
              </div>

              {/* Tags */}
              <div className="px-5 pb-4">
                <ContactTags
                  contactId={contact.id}
                  tags={contact.contactTags}
                />
              </div>

              {/* Tabs */}
              <div className="border-t border-outline-variant/10">
                <div className="px-5 pt-3">
                  <Tabs
                    tabs={drawerTabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>

                <div className="px-5 py-4">
                  {activeTab === "info" && (
                    <div className="space-y-3">
                      <InfoRow
                        label="Phone"
                        value={contact.phoneNumber}
                      />
                      <InfoRow
                        label="Email"
                        value={contact.email || "—"}
                      />
                      <InfoRow
                        label="Source"
                        value={contact.source}
                      />
                      <InfoRow
                        label="Owner"
                        value={`${contact.owner.firstName} ${contact.owner.lastName}`}
                      />
                      <InfoRow
                        label="Notes"
                        value={String(contact._count.notes)}
                      />
                      <InfoRow
                        label="Created"
                        value={new Date(
                          contact.createdAt,
                        ).toLocaleDateString()}
                      />
                      <InfoRow
                        label="Updated"
                        value={new Date(
                          contact.updatedAt,
                        ).toLocaleDateString()}
                      />
                    </div>
                  )}
                  {activeTab === "notes" && (
                    <ContactNotes contactId={contact.id} />
                  )}
                  {activeTab === "history" && (
                    <ContactHistory contactId={contact.id} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign owner modal */}
      {contact && (
        <AssignOwnerModal
          contactId={contact.id}
          currentOwnerId={contact.ownerId}
          open={showAssign}
          onClose={() => setShowAssign(false)}
        />
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-on-surface-variant/60">{label}</span>
      <span className="text-[13px] text-on-surface">{value}</span>
    </div>
  );
}
