import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '@/common/constants';
import { CsatRepository } from '@/modules/csat/infrastructure/repositories/csat.repository';
import type { ConversationClosedEvent } from '@/events/event-bus';

@Injectable()
export class CsatEventsHandler {
  private readonly logger = new Logger(CsatEventsHandler.name);

  constructor(private readonly csatRepo: CsatRepository) {}

  /**
   * Auto-send CSAT survey when a conversation is closed.
   * Only triggers on CLOSED status (not ARCHIVED).
   */
  @OnEvent(EVENT_NAMES.CONVERSATION_CLOSED)
  async handleConversationClosed(event: ConversationClosedEvent) {
    if (event.status !== 'CLOSED') return;

    try {
      // Check if a survey already exists for this conversation
      const existing = await this.csatRepo.findByConversation(event.conversationId);
      if (existing) {
        this.logger.debug(`CSAT survey already exists for conversation ${event.conversationId}, skipping`);
        return;
      }

      await this.csatRepo.create({
        orgId: event.orgId,
        conversationId: event.conversationId,
        contactPhone: event.contactPhone,
        agentId: event.closedById,
        channelType: 'whatsapp',
      });

      this.logger.log(`CSAT survey auto-sent for conversation ${event.conversationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to auto-send CSAT for conversation ${event.conversationId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
