import apiClient from "./client";
import type { CsatStats, CsatListResponse, CsatStatsParams } from "@/lib/types/csat";

export const csatApi = {
  getStats: (params?: CsatStatsParams) =>
    apiClient.get<CsatStats>("/csat/stats", { params }).then((r) => r.data),

  listSurveys: (params?: { take?: number; skip?: number; agentId?: string }) =>
    apiClient
      .get<CsatListResponse>("/csat/surveys", { params })
      .then((r) => r.data),

  sendSurvey: (data: {
    conversationId: string;
    contactPhone: string;
    channelType?: string;
  }) => apiClient.post("/csat/send", data).then((r) => r.data),
};
