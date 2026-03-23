import { Module } from '@nestjs/common';
import { WhatsAppModule } from '@/modules/whatsapp/whatsapp.module';
import { AuditModule } from '@/modules/audit/audit.module';
import { ContactsModule } from '@/modules/contacts/contacts.module';
import { CampaignsModule } from '@/modules/campaigns/campaigns.module';
import { AutomationModule } from '@/modules/automation/automation.module';
import { WebSocketModule } from '@/infrastructure/websocket/websocket.module';
import { ObservabilityModule } from '@/modules/observability/observability.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthEventsHandler } from './handlers/auth-events.handler';
import { OrgUserEventsHandler } from './handlers/org-user-events.handler';
import { WhatsAppEventsHandler } from './handlers/whatsapp-events.handler';
import { BaileysBridgeHandler } from './handlers/baileys-bridge.handler';
import { ContactEventsHandler } from './handlers/contact-events.handler';
import { CampaignEventsHandler } from './handlers/campaign-events.handler';
// EPIC 7 — Scheduling & Automation events
import { AutomationEventsHandler } from './handlers/automation-events.handler';
// EPIC 8 — RBAC & Access Control events
import { RbacEventsHandler } from './handlers/rbac-events.handler';
// EPIC 9 — Billing & Subscription events
import { BillingEventsHandler } from './handlers/billing-events.handler';
// EPIC 10 — Observability events
import { ObservabilityEventsHandler } from './handlers/observability-events.handler';
// EPIC 11 — Notification events
import { NotificationEventsHandler } from './handlers/notification-events.handler';
// EPIC 12 — Settings & Configuration events
import { SettingsEventsHandler } from './handlers/settings-events.handler';
import { SettingsModule } from '@/modules/settings/settings.module';

@Module({
  imports: [
    WhatsAppModule,
    AuditModule,
    ContactsModule,
    CampaignsModule,
    AutomationModule,
    WebSocketModule,
    ObservabilityModule,
    NotificationsModule,
    UsersModule,
    SettingsModule,
  ],
  providers: [
    AuthEventsHandler,
    OrgUserEventsHandler,
    WhatsAppEventsHandler,
    BaileysBridgeHandler,
    ContactEventsHandler,
    // EPIC 6 — Campaign Management events
    CampaignEventsHandler,
    // EPIC 7 — Scheduling & Automation events
    AutomationEventsHandler,
    // EPIC 8 — RBAC & Access Control events
    RbacEventsHandler,
    // EPIC 9 — Billing & Subscription events
    BillingEventsHandler,
    // EPIC 10 — Observability events
    ObservabilityEventsHandler,
    // EPIC 11 — Notification events
    NotificationEventsHandler,
    // EPIC 12 — Settings & Configuration events
    SettingsEventsHandler,
  ],
})
export class EventsModule {}
