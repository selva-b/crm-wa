import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { ConversationStatus } from '@prisma/client';
import { ListConversationsQueryDto } from '../dto';

@Injectable()
export class ListConversationsUseCase {
  constructor(private readonly conversationRepo: ConversationRepository) {}

  async execute(orgId: string, query: ListConversationsQueryDto) {
    return this.conversationRepo.findByOrgPaginated(orgId, {
      page: query.page,
      limit: query.limit,
      status: query.status as ConversationStatus | undefined,
      assignedToId: query.assignedToId,
      sessionId: query.sessionId,
    });
  }
}
