import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaignRepository } from '../../infrastructure/repositories/campaign.repository';
import { WhatsAppSessionRepository } from '@/modules/whatsapp/infrastructure/repositories/whatsapp-session.repository';
import { AuditService } from '@/modules/audit/domain/services/audit.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { EVENT_NAMES } from '@/common/constants';
import { AuditAction, CampaignStatus } from '@prisma/client';

@Injectable()
export class CreateCampaignUseCase {
  private readonly logger = new Logger(CreateCampaignUseCase.name);

  constructor(
    private readonly campaignRepo: CampaignRepository,
    private readonly sessionRepo: WhatsAppSessionRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    orgId: string,
    userId: string,
    dto: CreateCampaignDto,
    ipAddress: string,
    userAgent: string,
  ) {
    // 1. Idempotency check
    if (dto.idempotencyKey) {
      const existing = await this.campaignRepo.findByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        return { campaign: existing, deduplicated: true };
      }
    }

    // 2. Validate session exists and belongs to org
    const session = await this.sessionRepo.findByIdAndOrg(dto.sessionId, orgId);
    if (!session) {
      throw new BadRequestException('WhatsApp session not found');
    }
    if (session.status !== 'CONNECTED') {
      throw new BadRequestException(
        'WhatsApp session is not connected. Connect via QR first.',
      );
    }

    // 3. Validate message content
    if (dto.messageType === 'TEXT' && !dto.messageBody) {
      throw new BadRequestException('Text campaigns require a messageBody');
    }
    if (['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'].includes(dto.messageType) && !dto.mediaUrl) {
      throw new BadRequestException(`${dto.messageType} campaigns require a mediaUrl`);
    }

    // 4. Create campaign as DRAFT
    const campaign = await this.campaignRepo.create({
      orgId,
      sessionId: dto.sessionId,
      name: dto.name,
      description: dto.description,
      messageType: dto.messageType,
      messageBody: dto.messageBody,
      mediaUrl: dto.mediaUrl,
      mediaMimeType: dto.mediaMimeType,
      audienceType: dto.audienceType,
      audienceFilters: dto.audienceFilters as Record<string, unknown>,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      timezone: dto.timezone,
      createdById: userId,
      idempotencyKey: dto.idempotencyKey,
    });

    // 5. Record campaign event
    await this.campaignRepo.recordEvent({
      campaignId: campaign.id,
      orgId,
      newStatus: CampaignStatus.DRAFT,
      triggeredById: userId,
    });

    // 6. Emit event
    this.eventEmitter.emit(EVENT_NAMES.CAMPAIGN_CREATED, {
      campaignId: campaign.id,
      orgId,
      createdById: userId,
      name: dto.name,
    });

    // 7. Audit log
    await this.auditService.log({
      orgId,
      userId,
      action: AuditAction.CAMPAIGN_CREATED,
      targetType: 'Campaign',
      targetId: campaign.id,
      metadata: {
        name: dto.name,
        messageType: dto.messageType,
        audienceType: dto.audienceType,
        sessionId: dto.sessionId,
      },
      ipAddress,
      userAgent,
    });

    this.logger.log(`Campaign ${campaign.id} created by user ${userId}`);

    return { campaign, deduplicated: false };
  }
}
