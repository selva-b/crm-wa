"use client";

import { create } from "zustand";

type InboxFilter = "all" | "unread" | "mine";

interface InboxState {
  selectedConversationId: string | null;
  searchQuery: string;
  filter: InboxFilter;

  setSelectedConversation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: InboxFilter) => void;
}

export const useInboxStore = create<InboxState>()((set) => ({
  selectedConversationId: null,
  searchQuery: "",
  filter: "all",

  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilter: (filter) => set({ filter }),
}));
