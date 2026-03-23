import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AutomationTriggerType } from '@prisma/client';
import { AppWebSocketGateway } from '@/infrastructure/websocket/websocket.gateway';
import { EvaluateTriggerUseCase } from '@/modules/automation/application/use-cases/evaluate-trigger.use-case';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { EVENT_NAMES, QUEUE_NAMES } from '@/common/constants';
import {
  WhatsAppMessageReceivedEvent,
  ContactCreatedEvent,
  ContactAutoCreatedEvent,
  ContactStatusChangedEvent,
  AutomationExecutedEvent,
  AutomationFailedEvent,
  ScheduledMessageExecutedEvent,
  ScheduledMessageFailedEvent,
  AutomationRuleCreatedEvent,
  AutomationRuleEnabledEvent,
  AutomationRuleDisabledEvent,
  AutomationRuleDeletedEvent,
  FollowUpCancelledEvent,
  FollowUpExecutedEvent,
} from '../event-bus';

@Injectable()
export class AutomationEventsHandler {
  private readonly logger = new Logger(AutomationEventsHandler.name);

  constructor(
    private readonly evaluateTrigger: EvaluateTriggerUseCase,
    private readonly queueService: QueueService,
    private readonly wsGateway: AppWebSocketGateway,
  ) {}

  // ─── Trigger Evaluation Handlers ──────────────────

  @OnEvent(EVENT_NAMES.WHATSAPP_MESSAGE_RECEIVED)
  async handleMessageReceived(
    payload: WhatsAppMessageReceivedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Evaluating automation triggers for message: ${payload.messageId}`,
    );

    try {
      await this.evaluateTrigger.execute({
        orgId: payload.orgId,
        triggerType: AutomationTriggerType.MESSAGE_RECEIVED,
        eventPayload: {
          messageId: payload.messageId,
          sessionId: payload.sessionId,
          contactPhone: payload.contactPhone,
          type: payload.type,
          conversationId: payload.conversationId,
        },
        context: {
          message: {
            id: payload.messageId,
            type: payload.type,
            contactPhone: payload.contactPhone,
          },
        },
        contactId: undefined, // Will be resolved from contactPhone by the evaluator
      });

      // Also check for NO_REPLY triggers — schedule follow-up checks
      await this.scheduleNoReplyChecks(payload);
    } catch (error) {
      this.logger.error(
        `Error evaluating MESSAGE_RECEIVED trigger: ${error instanceof Error ? error.message : 'Unknown'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  @OnEvent(EVENT_NAMES.CONTACT_CREATED)
  async handleContactCreated(
    payload: ContactCreatedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Evaluating automation triggers for contact creation: ${payload.contactId}`,
    );

    try {
      await this.evaluateTrigger.execute({
        orgId: payload.orgId,
        triggerType: AutomationTriggerType.CONTACT_CREATED,
        eventPayload: {
          contactId: payload.contactId,
          phoneNumber: payload.phoneNumber,
          source: payload.source,
          ownerId: payload.ownerId,
        },
        context: {
          contact: {
            id: payload.contactId,
            phoneNumber: payload.phoneNumber,
            source: payload.source,
            ownerId: payload.ownerId,
          },
        },
        contactId: payload.contactId,
      });
    } catch (error) {
      this.logger.error(
        `Error evaluating CONTACT_CREATED trigger: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  @OnEvent(EVENT_NAMES.CONTACT_AUTO_CREATED)
  async handleContactAutoCreated(
    payload: ContactAutoCreatedEvent,
  ): Promise<void> {
    try {
      await this.evaluateTrigger.execute({
        orgId: payload.orgId,
        triggerType: AutomationTriggerType.CONTACT_CREATED,
        eventPayload: {
          contactId: payload.contactId,
          phoneNumber: payload.phoneNumber,
          source: 'WHATSAPP',
          ownerId: payload.ownerId,
          auto: true,
        },
        context: {
          contact: {
            id: payload.contactId,
            phoneNumber: payload.phoneNumber,
            source: 'WHATSAPP',
            ownerId: payload.ownerId,
          },
        },
        contactId: payload.contactId,
      });
    } catch (error) {
      this.logger.error(
        `Error evaluating CONTACT_AUTO_CREATED trigger: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  @OnEvent(EVENT_NAMES.CONTACT_STATUS_CHANGED)
  async handleContactStatusChanged(
    payload: ContactStatusChangedEvent,
  ): Promise<void> {
    this.logger.debug(
      `Evaluating automation triggers for status change: ${payload.contactId} ${payload.previousStatus} → ${payload.newStatus}`,
    );

    try {
      await this.evaluateTrigger.execute({
        orgId: payload.orgId,
        triggerType: AutomationTriggerType.LEAD_STATUS_CHANGED,
        eventPayload: {
          contactId: payload.contactId,
          previousStatus: payload.previousStatus,
          newStatus: payload.newStatus,
          changedById: payload.changedById,
        },
        context: {
          contact: {
            id: payload.contactId,
            leadStatus: payload.newStatus,
            previousLeadStatus: payload.previousStatus,
          },
        },
        contactId: payload.contactId,
      });
    } catch (error) {
      this.logger.error(
        `Error evaluating LEAD_STATUS_CHANGED trigger: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }
  }

  // ─── No-Reply Follow-Up Scheduling ──────────────

  private async scheduleNoReplyChecks(
    payload: WhatsAppMessageReceivedEvent,
  ): Promise<void> {
    // When a message is received, cancel any pending follow-up checks
    // for this contact, since they just replied
    // The follow-up worker will also check for recent replies before executing
  }

  // ─── Automation Lifecycle WebSocket Broadcasts ──────

  @OnEvent(EVENT_NAMES.AUTOMATION_RULE_CREATED)
  async handleRuleCreated(payload: AutomationRuleCreatedEvent): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:rule_created', {
      ruleId: payload.ruleId,
      name: payload.name,
      triggerType: payload.triggerType,
    });
  }

  @OnEvent(EVENT_NAMES.AUTOMATION_RULE_ENABLED)
  async handleRuleEnabled(payload: AutomationRuleEnabledEvent): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:rule_enabled', {
      ruleId: payload.ruleId,
    });
  }

  @OnEvent(EVENT_NAMES.AUTOMATION_RULE_DISABLED)
  async handleRuleDisabled(
    payload: AutomationRuleDisabledEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:rule_disabled', {
      ruleId: payload.ruleId,
    });
  }

  @OnEvent(EVENT_NAMES.AUTOMATION_RULE_DELETED)
  async handleRuleDeleted(payload: AutomationRuleDeletedEvent): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:rule_deleted', {
      ruleId: payload.ruleId,
    });
  }

  @OnEvent(EVENT_NAMES.AUTOMATION_EXECUTED)
  async handleAutomationExecuted(
    payload: AutomationExecutedEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:executed', {
      executionId: payload.executionId,
      ruleId: payload.ruleId,
      contactId: payload.contactId,
      executionTimeMs: payload.executionTimeMs,
    });
  }

  @OnEvent(EVENT_NAMES.AUTOMATION_FAILED)
  async handleAutomationFailed(
    payload: AutomationFailedEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:failed', {
      executionId: payload.executionId,
      ruleId: payload.ruleId,
      contactId: payload.contactId,
      error: payload.error,
    });
  }

  // ─── Scheduled Message WebSocket Broadcasts ──────

  @OnEvent(EVENT_NAMES.SCHEDULED_MESSAGE_EXECUTED)
  async handleScheduledMessageExecuted(
    payload: ScheduledMessageExecutedEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'scheduled_message:executed', {
      scheduledMessageId: payload.scheduledMessageId,
      contactPhone: payload.contactPhone,
    });
  }

  @OnEvent(EVENT_NAMES.SCHEDULED_MESSAGE_FAILED)
  async handleScheduledMessageFailed(
    payload: ScheduledMessageFailedEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'scheduled_message:failed', {
      scheduledMessageId: payload.scheduledMessageId,
      reason: payload.reason,
    });
  }

  @OnEvent(EVENT_NAMES.FOLLOW_UP_EXECUTED)
  async handleFollowUpExecuted(
    payload: FollowUpExecutedEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:follow_up_executed', {
      ruleId: payload.ruleId,
      contactId: payload.contactId,
    });
  }

  @OnEvent(EVENT_NAMES.FOLLOW_UP_CANCELLED)
  async handleFollowUpCancelled(
    payload: FollowUpCancelledEvent,
  ): Promise<void> {
    this.wsGateway.emitToOrg(payload.orgId, 'automation:follow_up_cancelled', {
      ruleId: payload.ruleId,
      contactId: payload.contactId,
      reason: payload.reason,
    });
  }
}
