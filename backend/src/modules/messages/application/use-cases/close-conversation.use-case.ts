import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditAction, ConversationStatus } from '@prisma/client';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { AuditService } from '@/modules/audit/domain/services/audit.service';
import { EVENT_NAMES } from '@/common/constants';
import type { ConversationClosedEvent } from '@/events/event-bus';

@Injectable()
export class CloseConversationUseCase {
  private readonly logger = new Logger(CloseConversationUseCase.name);

  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    conversationId: string,
    orgId: string,
    userId: string,
    status: 'CLOSED' | 'ARCHIVED',
    ipAddress: string,
    userAgent: string,
  ) {
    const conversation = await this.conversationRepo.findByIdAndOrg(conversationId, orgId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const newStatus = status === 'ARCHIVED' ? ConversationStatus.ARCHIVED : ConversationStatus.CLOSED;
    await this.conversationRepo.updateStatus(conversationId, newStatus);

    const auditAction = status === 'ARCHIVED'
      ? AuditAction.CONVERSATION_ARCHIVED
      : AuditAction.CONVERSATION_CLOSED;

    await this.auditService.log({
      orgId,
      userId,
      action: auditAction,
      targetType: 'Conversation',
      targetId: conversationId,
      metadata: {
        contactPhone: conversation.contactPhone,
        sessionId: conversation.sessionId,
        previousStatus: conversation.status,
        newStatus: status,
      },
      ipAddress,
      userAgent,
    });

    const event: ConversationClosedEvent = {
      conversationId,
      orgId,
      contactPhone: conversation.contactPhone,
      assignedToId: conversation.assignedToId,
      sessionId: conversation.sessionId ?? '',
      status,
      closedById: userId,
    };
    this.eventEmitter.emit(EVENT_NAMES.CONVERSATION_CLOSED, event);

    this.logger.log(`Conversation ${conversationId} ${status.toLowerCase()} by user ${userId}`);

    return { success: true, status };
  }
}
