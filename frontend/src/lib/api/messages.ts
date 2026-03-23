import apiClient from "./client";
import type {
  MessageResponse,
  MessagesListResponse,
  MessageEventResponse,
  SendMessageRequest,
  ListMessagesParams,
} from "@/lib/types/inbox";

export const messagesApi = {
  send: (data: SendMessageRequest) =>
    apiClient
      .post<MessageResponse>("/messaging/messages", data)
      .then((r) => r.data),

  list: (params: ListMessagesParams) =>
    apiClient
      .get<MessagesListResponse>("/messaging/messages", { params })
      .then((r) => r.data),

  getById: (messageId: string) =>
    apiClient
      .get<MessageResponse>(`/messaging/messages/${messageId}`)
      .then((r) => r.data),

  getEvents: (messageId: string) =>
    apiClient
      .get<MessageEventResponse[]>(`/messaging/messages/${messageId}/events`)
      .then((r) => r.data),
};
