"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, Plus, X, Loader2, ChevronRight, ArrowLeft, Send } from "lucide-react";
import type { FormEvent } from "react";
import apiClient from "@/lib/api/client";
import { Spinner } from "@/components/ui/spinner";

const CATEGORIES = ["GENERAL", "BILLING", "TECHNICAL", "FEATURE_REQUEST"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

// ─── API (uses org user JWT via apiClient) ────────────────────────────────────

const ticketApi = {
  list: (params?: { limit?: number }) =>
    apiClient.get<any>("/super-admin/tickets", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<any>(`/super-admin/tickets/${id}`).then((r) => r.data),
  create: (data: { title: string; description: string; category: string; priority: string }) =>
    apiClient.post<any>("/super-admin/tickets", data).then((r) => r.data),
  reply: (id: string, body: string) =>
    apiClient.post<any>(`/super-admin/tickets/${id}/replies`, { body }).then((r) => r.data),
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTickets() {
  return useQuery({ queryKey: ["support", "tickets"], queryFn: () => ticketApi.list({ limit: 50 }) });
}

function useTicket(id: string | null) {
  return useQuery({ queryKey: ["support", "ticket", id], queryFn: () => ticketApi.get(id!), enabled: !!id });
}

function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support", "tickets"] }),
  });
}

function useReply(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => ticketApi.reply(ticketId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support", "ticket", ticketId] }),
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-success/10 text-success",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400",
    RESOLVED: "bg-surface-container text-on-surface-variant",
    CLOSED: "bg-surface-container text-on-surface-variant",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-surface-container text-on-surface-variant"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ─── New Ticket Modal ─────────────────────────────────────────────────────────

function NewTicketModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTicket();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "GENERAL" as typeof CATEGORIES[number],
    priority: "MEDIUM" as typeof PRIORITIES[number],
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    create.mutate(form, {
      onSuccess: () => onClose(),
      onError: (err: any) => setError(err?.response?.data?.message ?? "Failed to create ticket"),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-semibold text-on-surface">New Support Ticket</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              maxLength={255}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-outline-variant rounded-lg py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 bg-primary text-on-primary rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Ticket Detail ────────────────────────────────────────────────────────────

function TicketDetail({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const { data: ticket, isLoading } = useTicket(ticketId);
  const reply = useReply(ticketId);
  const [body, setBody] = useState("");

  const handleReply = () => {
    if (!body.trim()) return;
    reply.mutate(body, { onSuccess: () => setBody("") });
  };

  if (isLoading) return <div className="flex items-center justify-center h-40"><Spinner /></div>;
  if (!ticket) return null;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </button>

      <div>
        <h2 className="text-lg font-semibold text-on-surface">{ticket.title}</h2>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={ticket.status} />
          <span className="text-xs text-on-surface-variant">{ticket.category.replace("_", " ")} · {new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-sm text-on-surface whitespace-pre-wrap">
        {ticket.description}
      </div>

      <div className="space-y-3">
        {ticket.replies?.map((r: any) => {
          const isSupport = !!r.superAdmin;
          return (
            <div key={r.id} className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm border ${
                isSupport
                  ? "bg-primary/10 border-primary/20"
                  : "bg-surface-container border-outline-variant"
              }`}>
                <div className="text-xs text-on-surface-variant mb-1">
                  {isSupport ? "Support Team" : "You"} · {new Date(r.createdAt).toLocaleString()}
                </div>
                <p className="text-on-surface whitespace-pre-wrap">{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" && (
        <div className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Add a reply..."
            className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            onClick={handleReply}
            disabled={!body.trim() || reply.isPending}
            className="bg-primary text-on-primary text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {reply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Reply
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { data, isLoading } = useTickets();
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return (
      <div className="p-6 max-w-2xl">
        <TicketDetail ticketId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" /> Support
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Submit and track your support tickets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : data?.tickets?.length === 0 ? (
        <div className="text-center py-16">
          <LifeBuoy className="h-10 w-10 mx-auto mb-3 text-on-surface-variant opacity-30" />
          <p className="font-medium text-on-surface">No tickets yet</p>
          <p className="text-sm text-on-surface-variant mt-1">Create a ticket and we'll get back to you.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.tickets?.map((t: any) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className="w-full text-left bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 hover:border-primary/40 hover:bg-surface-container transition-all flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-on-surface truncate">{t.title}</p>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t.category.replace("_", " ")} · {new Date(t.createdAt).toLocaleDateString()} · {t._count?.replies ?? 0} replies
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {showModal && <NewTicketModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
