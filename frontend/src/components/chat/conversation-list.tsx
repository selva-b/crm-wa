"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { ConversationItem, type Conversation } from "./conversation-item";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const filterTabs: TabItem[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "mine", label: "Mine" },
];

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      !search ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPhone.includes(search);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && c.unreadCount > 0);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-full flex-col bg-surface-container-lowest">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2 space-y-3">
        <h2 className="text-[16px] font-semibold text-on-surface">Inbox</h2>
        <SearchInput
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs
          tabs={filterTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-on-surface-variant/60">
              No conversations found
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
