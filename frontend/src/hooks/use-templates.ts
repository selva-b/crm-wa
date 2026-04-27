"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesApi } from "@/lib/api/templates";
import type { SendTemplateRequest, CreateTemplateRequest, UpdateTemplateRequest } from "@/lib/types/templates";

export const templateKeys = {
  all: ["templates"] as const,
  list: (status?: string) => ["templates", "list", status] as const,
  detail: (id: string) => ["templates", id] as const,
};

export function useTemplates(status?: string) {
  return useQuery({
    queryKey: templateKeys.list(status),
    queryFn: () => templatesApi.list(status),
    staleTime: 60_000,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesApi.getById(id),
    staleTime: 60_000,
    enabled: !!id,
  });
}

export function useSyncTemplates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) => templatesApi.sync(channelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

export function useSendTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendTemplateRequest) => templatesApi.send(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.all }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTemplateRequest) =>
      templatesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.all }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: templateKeys.all }),
  });
}

export function useGenerateTemplate() {
  return useMutation({
    mutationFn: (data: { prompt: string; category?: string; language?: string }) =>
      templatesApi.generate(data),
  });
}
