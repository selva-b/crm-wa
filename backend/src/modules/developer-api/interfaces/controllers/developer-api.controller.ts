import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  UseGuards,
  SetMetadata,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ApiKeyGuard } from '@/modules/api-keys/interfaces/guards/api-key.guard';
import { UsageLimitGuard, USAGE_LIMIT_KEY } from '@/modules/billing/interfaces/guards/usage-limit.guard';
import { UsageMetricType } from '@prisma/client';
import { DeveloperApiRepository } from '../../infrastructure/repositories/developer-api.repository';
import { DevSendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import {
  DevSendMessageDto,
  DevCreateContactDto,
  DevRegisterWebhookDto,
  DevUpdateWebhookDto,
  DevListMessagesQueryDto,
} from '../../application/dto';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { randomBytes } from 'crypto';

/**
 * Public Developer API — authenticated via X-API-Key header.
 * These are the endpoints developers call from their applications.
 */
@Controller('developer')
@Public() // Skip JWT auth
@UseGuards(ApiKeyGuard) // Use API key auth instead
export class DeveloperApiController {
  private readonly logger = new Logger(DeveloperApiController.name);

  constructor(
    private readonly repo: DeveloperApiRepository,
    private readonly sendMessageUseCase: DevSendMessageUseCase,
    private readonly prisma: PrismaService,
  ) {}

  // ── Messages ──

  @Post('messages/send')
  @SetMetadata(USAGE_LIMIT_KEY, UsageMetricType.MESSAGES_SENT)
  @UseGuards(UsageLimitGuard)
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Req() req: Request, @Body() dto: DevSendMessageDto) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.sendMessageUseCase.execute(orgId, dto);
  }

  @Get('messages')
  async listMessages(
    @Req() req: Request,
    @Query() query: DevListMessagesQueryDto,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.repo.listMessages(orgId, {
      limit: query.limit ?? 20,
      cursor: query.cursor,
      direction: query.direction,
      status: query.status,
    });
  }

  @Get('messages/:id')
  async getMessage(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    const message = await this.repo.getMessageById(id, orgId);
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  // ── Contacts ──

  @Get('contacts')
  async listContacts(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.repo.listContacts(orgId, Number(limit) || 20, cursor);
  }

  @Post('contacts')
  @HttpCode(HttpStatus.CREATED)
  async createContact(
    @Req() req: Request,
    @Body() dto: DevCreateContactDto,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.repo.createContact({
      orgId,
      name: dto.name,
      phoneNumber: dto.phone,
      email: dto.email,
      metadata: dto.metadata,
    });
  }

  // ── Session Status ──

  @Get('session/status')
  async getSessionStatus(@Req() req: Request) {
    const orgId = (req as any).apiKeyAuth.orgId;
    const sessions = await this.repo.getActiveSessions(orgId);
    return {
      connected: sessions.some((s) => s.status === 'CONNECTED'),
      sessions: sessions.map((s) => ({
        id: s.id,
        phoneNumber: s.phoneNumber,
        status: s.status,
        lastActiveAt: s.lastActiveAt,
      })),
    };
  }

  // ── Webhooks ──

  @Post('webhooks')
  @HttpCode(HttpStatus.CREATED)
  async registerWebhook(
    @Req() req: Request,
    @Body() dto: DevRegisterWebhookDto,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    const secret = randomBytes(32).toString('hex');
    const events = dto.events ?? ['message.received', 'message.status'];

    const webhook = await this.prisma.webhook.create({
      data: {
        orgId,
        url: dto.url,
        secret,
        description: dto.description ?? 'Developer API webhook',
        events,
        headers: dto.headers ?? undefined,
        enabled: true,
        maxRetries: 5,
        timeoutMs: 10000,
      },
      select: {
        id: true,
        url: true,
        events: true,
        enabled: true,
        createdAt: true,
      },
    });

    return { ...webhook, secret }; // Show secret once
  }

  @Get('webhooks')
  async listWebhooks(@Req() req: Request) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.prisma.webhook.findMany({
      where: { orgId, deletedAt: null },
      select: {
        id: true,
        url: true,
        events: true,
        enabled: true,
        failureCount: true,
        lastDeliveryAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Put('webhooks/:id')
  async updateWebhook(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DevUpdateWebhookDto,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    return this.prisma.webhook.updateMany({
      where: { id, orgId, deletedAt: null },
      data: {
        ...(dto.url && { url: dto.url }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.events && { events: dto.events }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      },
    });
  }

  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const orgId = (req as any).apiKeyAuth.orgId;
    await this.prisma.webhook.updateMany({
      where: { id, orgId },
      data: { deletedAt: new Date() },
    });
  }
}
