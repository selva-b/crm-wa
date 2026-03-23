import { Injectable, Logger } from '@nestjs/common';
import { AutomationActionType } from '@prisma/client';
import { QueueService } from '@/infrastructure/queue/queue.service';
import { QUEUE_NAMES } from '@/common/constants';

export interface ActionExecutionInput {
  orgId: string;
  contactId: string;
  sessionId?: string;
  actionType: AutomationActionType;
  actionConfig: Record<string, unknown>;
  executionId: string;
  ruleId: string;
}

export interface ActionResult {
  actionType: AutomationActionType;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(private readonly queueService: QueueService) {}

  async execute(input: ActionExecutionInput): Promise<ActionResult> {
    switch (input.actionType) {
      case AutomationActionType.SEND_MESSAGE:
        return this.executeSendMessage(input);

      case AutomationActionType.ASSIGN_CONTACT:
        return this.executeAssignContact(input);

      case AutomationActionType.ADD_TAG:
        return this.executeAddTag(input);

      case AutomationActionType.UPDATE_STATUS:
        return this.executeUpdateStatus(input);

      default:
        return {
          actionType: input.actionType,
          success: false,
          error: `Unknown action type: ${input.actionType}`,
        };
    }
  }

  private async executeSendMessage(
    input: ActionExecutionInput,
  ): Promise<ActionResult> {
    const { contactPhone, messageBody, messageType, sessionId } =
      input.actionConfig as {
        contactPhone?: string;
        messageBody?: string;
        messageType?: string;
        sessionId?: string;
      };

    const resolvedSessionId = sessionId || input.sessionId;

    if (!messageBody || !resolvedSessionId) {
      return {
        actionType: AutomationActionType.SEND_MESSAGE,
        success: false,
        error: 'Missing messageBody or sessionId in action config',
      };
    }

    try {
      const idempotencyKey = `auto-msg-${input.executionId}-${input.actionType}`;

      await this.queueService.publishOnce(
        QUEUE_NAMES.SEND_WHATSAPP_MESSAGE,
        {
          orgId: input.orgId,
          sessionId: resolvedSessionId,
          contactPhone: contactPhone || input.contactId,
          type: messageType || 'TEXT',
          body: messageBody,
          metadata: {
            automationRuleId: input.ruleId,
            automationExecutionId: input.executionId,
          },
          idempotencyKey,
        },
        idempotencyKey,
      );

      return {
        actionType: AutomationActionType.SEND_MESSAGE,
        success: true,
        result: { queued: true, idempotencyKey },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue SEND_MESSAGE: execution=${input.executionId}`,
        error,
      );
      return {
        actionType: AutomationActionType.SEND_MESSAGE,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeAssignContact(
    input: ActionExecutionInput,
  ): Promise<ActionResult> {
    const { assignToUserId } = input.actionConfig as {
      assignToUserId?: string;
    };

    if (!assignToUserId) {
      return {
        actionType: AutomationActionType.ASSIGN_CONTACT,
        success: false,
        error: 'Missing assignToUserId in action config',
      };
    }

    // Queue the assignment to avoid direct cross-module coupling
    try {
      await this.queueService.publishOnce(
        QUEUE_NAMES.AUTOMATION_EXECUTE_ACTION,
        {
          type: 'ASSIGN_CONTACT',
          orgId: input.orgId,
          contactId: input.contactId,
          assignToUserId,
          executionId: input.executionId,
          ruleId: input.ruleId,
        },
        `auto-assign-${input.executionId}-${input.contactId}`,
      );

      return {
        actionType: AutomationActionType.ASSIGN_CONTACT,
        success: true,
        result: { assignToUserId, queued: true },
      };
    } catch (error) {
      return {
        actionType: AutomationActionType.ASSIGN_CONTACT,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeAddTag(
    input: ActionExecutionInput,
  ): Promise<ActionResult> {
    const { tagId, tagName } = input.actionConfig as {
      tagId?: string;
      tagName?: string;
    };

    if (!tagId && !tagName) {
      return {
        actionType: AutomationActionType.ADD_TAG,
        success: false,
        error: 'Missing tagId or tagName in action config',
      };
    }

    try {
      await this.queueService.publishOnce(
        QUEUE_NAMES.AUTOMATION_EXECUTE_ACTION,
        {
          type: 'ADD_TAG',
          orgId: input.orgId,
          contactId: input.contactId,
          tagId,
          tagName,
          executionId: input.executionId,
          ruleId: input.ruleId,
        },
        `auto-tag-${input.executionId}-${input.contactId}-${tagId || tagName}`,
      );

      return {
        actionType: AutomationActionType.ADD_TAG,
        success: true,
        result: { tagId, tagName, queued: true },
      };
    } catch (error) {
      return {
        actionType: AutomationActionType.ADD_TAG,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async executeUpdateStatus(
    input: ActionExecutionInput,
  ): Promise<ActionResult> {
    const { newStatus } = input.actionConfig as {
      newStatus?: string;
    };

    if (!newStatus) {
      return {
        actionType: AutomationActionType.UPDATE_STATUS,
        success: false,
        error: 'Missing newStatus in action config',
      };
    }

    try {
      await this.queueService.publishOnce(
        QUEUE_NAMES.AUTOMATION_EXECUTE_ACTION,
        {
          type: 'UPDATE_STATUS',
          orgId: input.orgId,
          contactId: input.contactId,
          newStatus,
          executionId: input.executionId,
          ruleId: input.ruleId,
        },
        `auto-status-${input.executionId}-${input.contactId}`,
      );

      return {
        actionType: AutomationActionType.UPDATE_STATUS,
        success: true,
        result: { newStatus, queued: true },
      };
    } catch (error) {
      return {
        actionType: AutomationActionType.UPDATE_STATUS,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
