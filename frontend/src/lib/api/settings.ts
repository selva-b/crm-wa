import apiClient from "./client";
import type {
  OrgSettings,
  UpdateOrgSettingsRequest,
  WhatsAppConfig,
  UpdateWhatsAppConfigRequest,
  FeatureFlags,
  UpdateFeatureFlagsRequest,
  Webhook,
  WebhookListResponse,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDeliveryListResponse,
  WebhookTestResult,
  IntegrationConfig,
  CreateIntegrationConfigRequest,
  UpdateIntegrationConfigRequest,
  IntegrationTestResult,
} from "@/lib/types/settings";

export const settingsApi = {
  // ─── Organization ───

  getOrgSettings: () =>
    apiClient.get<OrgSettings>("/settings/organization").then((r) => r.data),

  updateOrgSettings: (data: UpdateOrgSettingsRequest) =>
    apiClient
      .patch<OrgSettings>("/settings/organization", data)
      .then((r) => r.data),

  // ─── WhatsApp Config ───

  getWhatsAppConfig: () =>
    apiClient
      .get<WhatsAppConfig>("/settings/whatsapp-config")
      .then((r) => r.data),

  updateWhatsAppConfig: (data: UpdateWhatsAppConfigRequest) =>
    apiClient
      .patch<WhatsAppConfig>("/settings/whatsapp-config", data)
      .then((r) => r.data),

  // ─── Feature Flags ───

  getFeatureFlags: () =>
    apiClient.get<FeatureFlags>("/settings/feature-flags").then((r) => r.data),

  updateFeatureFlags: (data: UpdateFeatureFlagsRequest) =>
    apiClient
      .patch<FeatureFlags>("/settings/feature-flags", data)
      .then((r) => r.data),

  // ─── Notification Preferences ───
  // Moved to notificationsApi (GET/PATCH /notifications/preferences)

  // ─── Integrations (EPIC 12) ───

  listIntegrations: () =>
    apiClient
      .get<IntegrationConfig[]>("/settings/integrations")
      .then((r) => r.data),

  getIntegration: (id: string) =>
    apiClient
      .get<IntegrationConfig>(`/settings/integrations/${id}`)
      .then((r) => r.data),

  createIntegration: (data: CreateIntegrationConfigRequest) =>
    apiClient
      .post<IntegrationConfig>("/settings/integrations", data)
      .then((r) => r.data),

  updateIntegration: (id: string, data: UpdateIntegrationConfigRequest) =>
    apiClient
      .patch<IntegrationConfig>(`/settings/integrations/${id}`, data)
      .then((r) => r.data),

  deleteIntegration: (id: string) =>
    apiClient.delete(`/settings/integrations/${id}`).then((r) => r.data),

  testIntegration: (id: string) =>
    apiClient
      .post<IntegrationTestResult>(`/settings/integrations/${id}/test`)
      .then((r) => r.data),

  // ─── Webhooks (EPIC 12 Enhanced) ───

  listWebhooks: () =>
    apiClient.get<WebhookListResponse>("/settings/webhooks").then((r) => r.data),

  getWebhook: (id: string) =>
    apiClient.get<Webhook>(`/settings/webhooks/${id}`).then((r) => r.data),

  createWebhook: (data: CreateWebhookRequest) =>
    apiClient.post<Webhook>("/settings/webhooks", data).then((r) => r.data),

  updateWebhook: (webhookId: string, data: UpdateWebhookRequest) =>
    apiClient
      .patch<Webhook>(`/settings/webhooks/${webhookId}`, data)
      .then((r) => r.data),

  deleteWebhook: (webhookId: string) =>
    apiClient.delete(`/settings/webhooks/${webhookId}`).then((r) => r.data),

  testWebhook: (id: string) =>
    apiClient
      .post<WebhookTestResult>(`/settings/webhooks/${id}/test`)
      .then((r) => r.data),

  listWebhookDeliveries: (
    webhookId: string,
    params?: { status?: string; eventType?: string; limit?: number; offset?: number },
  ) =>
    apiClient
      .get<WebhookDeliveryListResponse>(
        `/settings/webhooks/${webhookId}/deliveries`,
        { params },
      )
      .then((r) => r.data),
};
