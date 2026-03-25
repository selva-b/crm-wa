import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConversationRepository } from '../../infrastructure/repositories/conversation.repository';
import { WhatsAppSessionRepository } from '@/modules/whatsapp/infrastructure/repositories/whatsapp-session.repository';
import { GetTeamSessionIdsUseCase } from '@/modules/teams/application/use-cases/get-team-session-ids.use-case';
import { ConversationStatus } from '@prisma/client';
import { ListConversationsQueryDto } from '../dto';

@Injectable()
export class ListConversationsUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly sessionRepo: WhatsAppSessionRepository,
    private readonly getTeamSessionIds: GetTeamSessionIdsUseCase,
  ) {}

  async execute(
    orgId: string,
    userId: string,
    role: string,
    query: ListConversationsQueryDto,
  ) {
    let sessionId = query.sessionId;
    let sessionIds: string[] | undefined;

    if (role === 'EMPLOYEE') {
      // Employee: force to own session only
      const session = await this.sessionRepo.findActiveByUserId(userId, orgId);
      if (!session) {
        return { data: [], total: 0, page: query.page, limit: query.limit };
      }
      sessionId = session.id;
    } else if (role === 'MANAGER') {
      if (query.targetUserId) {
        // Drill-down: validate target is in manager's team
        const { userIds } = await this.getTeamSessionIds.execute(userId, orgId);
        if (!userIds.includes(query.targetUserId)) {
          throw new ForbiddenException('User is not in your team');
        }
        const session = await this.sessionRepo.findActiveByUserId(query.targetUserId, orgId);
        if (!session) {
          return { data: [], total: 0, page: query.page, limit: query.limit };
        }
        sessionId = session.id;
      } else if (query.teamView) {
        // Team view: all team members' sessions
        const result = await this.getTeamSessionIds.execute(userId, orgId);
        sessionIds = result.sessionIds;
      } else {
        // Default: own session only
        const session = await this.sessionRepo.findActiveByUserId(userId, orgId);
        if (!session) {
          return { data: [], total: 0, page: query.page, limit: query.limit };
        }
        sessionId = session.id;
      }
    } else if (role === 'ADMIN') {
      if (query.targetUserId) {
        // Drill-down into any user's session
        const session = await this.sessionRepo.findActiveByUserId(query.targetUserId, orgId);
        if (!session) {
          return { data: [], total: 0, page: query.page, limit: query.limit };
        }
        sessionId = session.id;
      }
      // No targetUserId = all org conversations (existing behavior)
    }

    return this.conversationRepo.findByOrgPaginated(orgId, {
      page: query.page,
      limit: query.limit,
      status: query.status as ConversationStatus | undefined,
      assignedToId: query.assignedToId,
      sessionId,
      sessionIds,
    });
  }
}
