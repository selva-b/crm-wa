"use client";

import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";

export type MessageDirection = "incoming" | "outgoing";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: MessageDirection;
  status: MessageStatus;
  createdAt: string;
  senderName?: string;
}

interface MessageBubbleProps {
  message: Message;
}

function StatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 text-on-surface-variant/50" />;
    case "sent":
      return <Check className="h-3 w-3 text-on-surface-variant/50" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-on-surface-variant/50" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-primary" />;
    case "failed":
      return <span className="text-[10px] text-error font-medium">Failed</span>;
    default:
      return null;
  }
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div
      className={cn(
        "flex",
        isOutgoing ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2.5",
          isOutgoing
            ? "bg-gradient-to-br from-primary to-primary/80 text-on-primary"
            : "bg-surface-container text-on-surface",
        )}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOutgoing ? "justify-end" : "justify-start",
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isOutgoing ? "text-on-primary/70" : "text-on-surface-variant/60",
            )}
          >
            {formatMessageTime(message.createdAt)}
          </span>
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
