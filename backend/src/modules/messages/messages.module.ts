import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { WhatsAppModule } from '@/modules/whatsapp/whatsapp.module';
import { TeamsModule } from '@/modules/teams/teams.module';
import { ChannelsModule } from '@/modules/channels/channels.module';

// Repositories
import { MessageRepository } from './infrastructure/repositories/message.repository';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { MessageEventRepository } from './infrastructure/repositories/message-event.repository';
import { DeadLetterRepository } from './infrastructure/repositories/dead-letter.repository';
import { CannedResponseRepository } from './infrastructure/repositories/canned-response.repository';
import { TemplateRepository } from './infrastructure/repositories/template.repository';

// Domain services
import { RateLimiterService } from './domain/services/rate-limiter.service';

// Use cases
import {
  SendMessageUseCase,
  GetMessageUseCase,
  ListMessagesUseCase,
  ListConversationsUseCase,
  MarkConversationReadUseCase,
  ListDeadLettersUseCase,
  ReprocessDeadLetterUseCase,
} from './application/use-cases';
import { DeleteConversationUseCase } from './application/use-cases/delete-conversation.use-case';
import { SyncTemplatesUseCase } from './application/use-cases/sync-templates.use-case';
import { SendTemplateMessageUseCase } from './application/use-cases/send-template-message.use-case';

// Controllers
import { MessagesController } from './interfaces/controllers/messages.controller';
import { CannedResponsesController } from './interfaces/controllers/canned-responses.controller';
import { TemplatesController } from './interfaces/controllers/templates.controller';

@Module({
  imports: [AuditModule, forwardRef(() => WhatsAppModule), forwardRef(() => TeamsModule), ChannelsModule],
  controllers: [MessagesController, CannedResponsesController, TemplatesController],
  providers: [
    // Repositories
    MessageRepository,
    ConversationRepository,
    MessageEventRepository,
    DeadLetterRepository,

    // Domain services
    RateLimiterService,

    // Use cases
    SendMessageUseCase,
    GetMessageUseCase,
    ListMessagesUseCase,
    ListConversationsUseCase,
    MarkConversationReadUseCase,
    ListDeadLettersUseCase,
    ReprocessDeadLetterUseCase,
    DeleteConversationUseCase,
    CannedResponseRepository,
    TemplateRepository,
    SyncTemplatesUseCase,
    SendTemplateMessageUseCase,
  ],
  exports: [
    MessageRepository,
    ConversationRepository,
    MessageEventRepository,
    DeadLetterRepository,
    RateLimiterService,
  ],
})
export class MessagesModule {}
