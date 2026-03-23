"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/use-page-title";
import { useUIStore } from "@/stores/ui-store";
import { useInboxStore } from "@/stores/inbox-store";
import { useWhatsAppSession, useWhatsAppSocket } from "@/hooks/use-whatsapp";
import { useWhatsAppStore } from "@/stores/whatsapp-store";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
} from "@/hooks/use-conversations";
import { useInboxSocket } from "@/hooks/use-inbox-socket";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageThread } from "@/components/chat/message-thread";
import { ChatInput } from "@/components/chat/chat-input";
import { ContactPanel } from "@/components/chat/contact-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Conversation } from "@/components/chat/conversation-item";
import type { Message } from "@/components/chat/message-bubble";
import type {
  ConversationResponse,
  MessageResponse,
  MessageStatus as BackendMessageStatus,
} from "@/lib/types/inbox";

// ─── Mappers: backend types → component props ──────────

function mapConversation(c: ConversationResponse): Conversation {
  return {
    id: c.id,
    contactName: c.contactName || c.contactPhone,
    contactPhone: c.contactPhone,
    lastMessage: c.lastMessageBody || "",
    lastMessageAt: c.lastMessageAt || c.createdAt,
    unreadCount: c.unreadCount,
  };
}

function mapMessageStatus(
  status: BackendMessageStatus,
): Message["status"] {
  switch (status) {
    case "QUEUED":
    case "PROCESSING":
      return "sending";
    case "SENT":
      return "sent";
    case "DELIVERED":
      return "delivered";
    case "READ":
      return "read";
    case "FAILED":
      return "failed";
    default:
      return "sending";
  }
}

function mapMessage(m: MessageResponse): Message {
  return {
    id: m.id,
    conversationId: m.conversationId || "",
    content: m.body || "",
    direction: m.direction === "OUTBOUND" ? "outgoing" : "incoming",
    status: mapMessageStatus(m.status),
    createdAt: m.createdAt,
    senderName: m.contactName || undefined,
  };
}

// ─── Page Component ───────────────────────────────────────
export default function InboxPage() {
  usePageTitle("Inbox");
  const router = useRouter();
  const contactPanelOpen = useUIStore((s) => s.contactPanelOpen);
  const toggleContactPanel = useUIStore((s) => s.toggleContactPanel);

  // Inbox store state
  const selectedId = useInboxStore((s) => s.selectedConversationId);
  const setSelectedId = useInboxStore((s) => s.setSelectedConversation);
  const filter = useInboxStore((s) => s.filter);

  // WhatsApp session awareness
  const { isLoading: sessionLoading } = useWhatsAppSession();
  useWhatsAppSocket();
  useInboxSocket();
  const waStatus = useWhatsAppStore((s) => s.status);

  // ─── Data hooks ───
  const conversationsQuery = useConversations(
    filter === "unread" ? { status: "OPEN" } : undefined,
  );
  const messagesQuery = useMessages(selectedId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // ─── Map backend data to component props ───
  const conversations = useMemo<Conversation[]>(() => {
    const raw = conversationsQuery.data?.data ?? [];
    const mapped = raw.map(mapConversation);

    if (filter === "unread") {
      return mapped.filter((c) => c.unreadCount > 0);
    }
    return mapped;
  }, [conversationsQuery.data, filter]);

  const currentMessages = useMemo<Message[]>(
    () => (messagesQuery.data?.data ?? []).map(mapMessage),
    [messagesQuery.data],
  );

  const selectedConversation = conversations.find(
    (c) => c.id === selectedId,
  );

  // ─── Mark conversation as read on select ───
  useEffect(() => {
    if (!selectedId) return;
    const conv = conversationsQuery.data?.data?.find(
      (c) => c.id === selectedId,
    );
    if (conv && conv.unreadCount > 0) {
      markAsRead.mutate(selectedId);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDisconnected =
    waStatus === "disconnected" || waStatus === "reconnecting";
  const hasNoSession = waStatus === "no_session";
  const isConnecting = waStatus === "connecting";

  // ─── Send handler ───
  const handleSend = useCallback(
    (content: string) => {
      if (!selectedConversation) return;
      sendMessage.mutate({
        contactPhone: selectedConversation.contactPhone,
        contactName: selectedConversation.contactName,
        type: "TEXT",
        body: content,
        idempotencyKey: `${selectedConversation.id}-${Date.now()}`,
      });
    },
    [selectedConversation, sendMessage],
  );

  // ─── Loading ───
  if (sessionLoading) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  // ─── No Session / Connecting: Full-page empty state ───
  if (hasNoSession || isConnecting) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))]">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<MessageSquare className="h-16 w-16" />}
            title="Connect WhatsApp to start messaging"
            description="Link your WhatsApp account to send and receive messages directly from your CRM."
            actionLabel="Connect WhatsApp"
            onAction={() => router.push("/settings/whatsapp")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height))]">
      {/* Left panel — Conversation list */}
      <div className="w-[320px] shrink-0 border-r border-outline-variant/15">
        <ConversationList
          conversations={conversations}
          activeId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Center panel — Message thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Disconnected banner */}
        {isDisconnected && (
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-warning-container/80 border-b border-warning/20">
            <div className="flex items-center gap-2 text-warning">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span className="text-[13px] font-medium">
                {waStatus === "reconnecting"
                  ? "Reconnecting to WhatsApp..."
                  : "Your WhatsApp session was disconnected"}
              </span>
            </div>
            {waStatus === "disconnected" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/settings/whatsapp")}
                className="shrink-0"
              >
                Reconnect Now
              </Button>
            )}
          </div>
        )}

        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-outline-variant/15">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={selectedConversation.contactName}
                  size="sm"
                />
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-on-surface truncate">
                    {selectedConversation.contactName}
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">
                    {selectedConversation.contactPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleContactPanel}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    contactPanelOpen
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                  )}
                  title={
                    contactPanelOpen
                      ? "Hide contact info"
                      : "Show contact info"
                  }
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            {messagesQuery.isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner size="md" className="text-primary" />
              </div>
            ) : (
              <MessageThread messages={currentMessages} />
            )}

            {/* Input — disabled when disconnected */}
            {isDisconnected ? (
              <div className="shrink-0 px-4 py-3 border-t border-outline-variant/15">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container px-4 py-3 text-[13px] text-on-surface-variant/50">
                  <WifiOff className="h-4 w-4" />
                  Session disconnected — reconnect to send messages
                </div>
              </div>
            ) : (
              <ChatInput
                onSend={handleSend}
                disabled={sendMessage.isPending}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon={<MessageSquare className="h-16 w-16" />}
            title="No conversation selected"
            description="Select a conversation from the list to start chatting."
            className="flex-1"
          />
        )}
      </div>

      {/* Right panel — Contact details (placeholder until contact fetch is wired) */}
      {contactPanelOpen && selectedConversation && selectedId && (
        <div className="w-[300px] shrink-0 border-l border-outline-variant/15">
          <ContactPanel
            contact={{
              id: selectedId,
              name: selectedConversation.contactName,
              phone: selectedConversation.contactPhone,
              leadStatus: "new",
              tags: [],
              notes: "",
            }}
            onClose={toggleContactPanel}
          />
        </div>
      )}
    </div>
  );
}
