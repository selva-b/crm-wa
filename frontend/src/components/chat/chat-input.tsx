"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Paperclip, Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="shrink-0 border-t border-outline-variant/15 px-4 py-3">
      <div className="flex items-end gap-2 rounded-2xl bg-surface-container px-3 py-2">
        <button
          type="button"
          className="shrink-0 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="shrink-0 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg"
          title="Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-h-[24px] max-h-[120px] py-1"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            "shrink-0 p-2 rounded-xl transition-colors",
            value.trim() && !disabled
              ? "bg-primary text-on-primary hover:bg-primary/90"
              : "text-on-surface-variant/40 cursor-not-allowed",
          )}
          title="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
