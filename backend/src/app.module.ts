import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Config
import {
  appConfig,
  jwtConfig,
  emailConfig,
  authConfig,
  throttleConfig,
  whatsappConfig,
} from './config';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { EmailModule } from './infrastructure/email/email.module';
import { WebSocketModule } from './infrastructure/websocket/websocket.module';
import { WhatsAppApiModule } from './infrastructure/external/whatsapp/whatsapp-api.module';
import { LoggerModule } from './infrastructure/logger/logger.module';

// Domain modules
import { AuthModule } from './modules/auth/auth.module';
import { OrgModule } from './modules/org/org.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AutomationModule } from './modules/automation/automation.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { BillingModule } from './modules/billing/billing.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';

// Guards & Interceptors
import { JwtAuthGuard } from './modules/auth/interfaces/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { OrgScopeInterceptor } from './common/interceptors/org-scope.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// Middleware
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';

// Jobs & Events
import { JobsModule } from './jobs/jobs.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Config (loads .env + typed config)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, emailConfig, authConfig, throttleConfig, whatsappConfig],
      envFilePath: ['.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Internal event bus
    EventEmitterModule.forRoot({
      wildcard: false,
      maxListeners: 30,
    }),

    // Infrastructure
    DatabaseModule,
    QueueModule,
    EmailModule,
    WebSocketModule,
    WhatsAppApiModule,
    LoggerModule,

    // Domain modules
    AuthModule,
    OrgModule,
    UsersModule,
    WhatsAppModule,
    MessagesModule,
    ContactsModule,
    CampaignsModule,
    AutomationModule,
    SchedulerModule,
    RbacModule,
    BillingModule,
    ObservabilityModule,
    NotificationsModule,
    SettingsModule,

    // Background workers
    JobsModule,

    // Event handlers
    EventsModule,
  ],
  providers: [
    // Global exception filter — enhanced with structured logging + error tracking
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global JWT guard — all routes require auth by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global permissions guard (replaces RolesGuard, with backward compatibility)
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    // Global rate limit guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global org-scope interceptor — enforces multi-tenant isolation
    {
      provide: APP_INTERCEPTOR,
      useClass: OrgScopeInterceptor,
    },
    // Global request logging + metrics interceptor (EPIC 10)
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply trace ID middleware to all routes
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
