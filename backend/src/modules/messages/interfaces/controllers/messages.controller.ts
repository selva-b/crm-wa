import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import {
  SendMessageDto,
  ListMessagesQueryDto,
  ListConversationsQueryDto,
  ListDeadLettersQueryDto,
} from '../../application/dto';
import {
  SendMessageUseCase,
  GetMessageUseCase,
  ListMessagesUseCase,
  ListConversationsUseCase,
  MarkConversationReadUseCase,
  ListDeadLettersUseCase,
  ReprocessDeadLetterUseCase,
} from '../../application/use-cases';

@Controller('messaging')
export class MessagesController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessageUseCase: GetMessageUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly markConversationReadUseCase: MarkConversationReadUseCase,
    private readonly listDeadLettersUseCase: ListDeadLettersUseCase,
    private readonly reprocessDeadLetterUseCase: ReprocessDeadLetterUseCase,
  ) {}

  // ───── Messages ─────

  @Post('messages')
  @Permissions(PERMISSIONS.MESSAGES_SEND)
  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    return this.sendMessageUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      this.getIp(req),
      this.getUa(req),
    );
  }

  @Get('messages')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async listMessages(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.listMessagesUseCase.execute(user.orgId, query);
  }

  @Get('messages/:messageId')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async getMessage(
    @CurrentUser() user: JwtPayload,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.getMessageUseCase.execute(messageId, user.orgId);
  }

  @Get('messages/:messageId/events')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async getMessageEvents(
    @CurrentUser() user: JwtPayload,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.getMessageUseCase.executeWithEvents(messageId, user.orgId);
  }

  // ───── Conversations ─────

  @Get('conversations')
  @Permissions(PERMISSIONS.CONVERSATIONS_READ)
  async listConversations(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListConversationsQueryDto,
  ) {
    return this.listConversationsUseCase.execute(user.orgId, query);
  }

  @Post('conversations/:conversationId/read')
  @Permissions(PERMISSIONS.CONVERSATIONS_UPDATE)
  @HttpCode(HttpStatus.OK)
  async markConversationRead(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.markConversationReadUseCase.execute(conversationId, user.orgId);
  }

  // ───── Dead-Letter Queue (Admin) ─────

  @Get('dead-letters')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.DEAD_LETTERS_READ)
  async listDeadLetters(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListDeadLettersQueryDto,
  ) {
    return this.listDeadLettersUseCase.execute(user.orgId, query);
  }

  @Post('dead-letters/:id/reprocess')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.DEAD_LETTERS_REPROCESS)
  @HttpCode(HttpStatus.OK)
  async reprocessDeadLetter(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reprocessDeadLetterUseCase.execute(id, user.orgId, user.sub);
  }

  // ───── Helpers ─────

  private getIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private getUa(req: Request): string {
    return (req.headers['user-agent'] as string) || 'unknown';
  }
}
