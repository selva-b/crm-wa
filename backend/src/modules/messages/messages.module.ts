import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '@/modules/audit/audit.module';
import { WhatsAppModule } from '@/modules/whatsapp/whatsapp.module';

// Repositories
import { MessageRepository } from './infrastructure/repositories/message.repository';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { MessageEventRepository } from './infrastructure/repositories/message-event.repository';
import { DeadLetterRepository } from './infrastructure/repositories/dead-letter.repository';

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

// Controller
import { MessagesController } from './interfaces/controllers/messages.controller';

@Module({
  imports: [AuditModule, forwardRef(() => WhatsAppModule)],
  controllers: [MessagesController],
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
