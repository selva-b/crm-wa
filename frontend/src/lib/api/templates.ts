import apiClient from "./client";
import type {
  MessageTemplate,
  SendTemplateRequest,
} from "@/lib/types/templates";

export const templatesApi = {
  list: (status?: string) =>
    apiClient
      .get<MessageTemplate[]>("/messaging/templates", {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<MessageTemplate>(`/messaging/templates/${id}`).then((r) => r.data),

  sync: (channelId: string) =>
    apiClient
      .post<{ synced: number }>("/messaging/templates/sync", { channelId })
      .then((r) => r.data),

  send: (data: SendTemplateRequest) =>
    apiClient.post("/messaging/templates/send", data).then((r) => r.data),
};
