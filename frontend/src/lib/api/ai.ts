import apiClient from "./client";
import type { SmartRepliesResponse, ConversationSummary } from "@/lib/types/ai";

export interface SentimentResult {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT";
  confidence: number;
  reason: string;
}

export interface CategorizationResult {
  suggestedLabels: string[];
  intent: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  language: string;
}

export interface KbRagResult {
  answer: string;
  sources: { articleId: string; title: string; slug: string; relevance: number }[];
  confidence: number;
}

export interface IntentResult {
  primaryIntent: string;
  subIntent: string | null;
  entities: Record<string, string>;
  suggestedAction: string | null;
}

export interface FullAnalysis {
  sentiment: SentimentResult;
  categorization: CategorizationResult;
  intent: IntentResult;
  kbSuggestions: KbRagResult;
  summary: ConversationSummary;
}

export const aiApi = {
  getSmartReplies: (conversationId: string) =>
    apiClient.get<SmartRepliesResponse>(`/ai/smart-replies/${conversationId}`).then((r) => r.data),

  summarize: (conversationId: string) =>
    apiClient.post<ConversationSummary>(`/ai/summarize/${conversationId}`).then((r) => r.data),

  getSentiment: (conversationId: string) =>
    apiClient.get<SentimentResult>(`/ai/sentiment/${conversationId}`).then((r) => r.data),

  getCategorization: (conversationId: string) =>
    apiClient.get<CategorizationResult>(`/ai/categorize/${conversationId}`).then((r) => r.data),

  applyCategorization: (conversationId: string) =>
    apiClient.post<CategorizationResult>(`/ai/categorize/${conversationId}/apply`).then((r) => r.data),

  kbSearch: (query: string) =>
    apiClient.get<KbRagResult>(`/ai/kb-search`, { params: { q: query } }).then((r) => r.data),

  kbSuggest: (conversationId: string) =>
    apiClient.get<KbRagResult>(`/ai/kb-suggest/${conversationId}`).then((r) => r.data),

  detectIntent: (conversationId: string) =>
    apiClient.get<IntentResult>(`/ai/intent/${conversationId}`).then((r) => r.data),

  fullAnalysis: (conversationId: string) =>
    apiClient.post<FullAnalysis>(`/ai/analyze/${conversationId}`).then((r) => r.data),
};
