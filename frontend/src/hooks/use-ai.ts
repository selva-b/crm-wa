"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "@/lib/api/ai";

export function useSmartReplies(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "smart-replies", conversationId],
    queryFn: () => aiApi.getSmartReplies(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useSummarizeConversation() {
  return useMutation({
    mutationFn: (conversationId: string) => aiApi.summarize(conversationId),
  });
}

export function useSentiment(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "sentiment", conversationId],
    queryFn: () => aiApi.getSentiment(conversationId!),
    enabled: !!conversationId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCategorization(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "categorization", conversationId],
    queryFn: () => aiApi.getCategorization(conversationId!),
    enabled: !!conversationId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useApplyCategorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => aiApi.applyCategorization(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useKbSearch(query: string) {
  return useQuery({
    queryKey: ["ai", "kb-search", query],
    queryFn: () => aiApi.kbSearch(query),
    enabled: query.length >= 3,
    staleTime: 120_000,
  });
}

export function useKbSuggest(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "kb-suggest", conversationId],
    queryFn: () => aiApi.kbSuggest(conversationId!),
    enabled: !!conversationId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useDetectIntent(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai", "intent", conversationId],
    queryFn: () => aiApi.detectIntent(conversationId!),
    enabled: !!conversationId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useFullAnalysis() {
  return useMutation({
    mutationFn: (conversationId: string) => aiApi.fullAnalysis(conversationId),
  });
}
