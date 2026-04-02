import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { TemplateRepository } from '../../infrastructure/repositories/template.repository';
import { SyncTemplatesUseCase } from '../../application/use-cases/sync-templates.use-case';
import { SendTemplateMessageUseCase } from '../../application/use-cases/send-template-message.use-case';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
} from 'class-validator';

class SendTemplateDto {
  @IsUUID() channelId: string;
  @IsUUID() templateId: string;
  @IsString() @IsNotEmpty() contactPhone: string;
  @IsOptional() @IsObject() variables?: Record<string, string>;
  @IsOptional() @IsUUID() conversationId?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
}

@Controller('messaging/templates')
export class TemplatesController {
  constructor(
    private readonly templateRepo: TemplateRepository,
    private readonly syncTemplates: SyncTemplatesUseCase,
    private readonly sendTemplate: SendTemplateMessageUseCase,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return this.templateRepo.list(user.orgId, status);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.MESSAGES_READ)
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.templateRepo.findById(id, user.orgId);
  }

  @Post('sync')
  @Permissions(PERMISSIONS.MESSAGES_SEND)
  async sync(
    @CurrentUser() user: JwtPayload,
    @Body('channelId') channelId: string,
  ) {
    const count = await this.syncTemplates.execute(user.orgId, channelId);
    return { synced: count };
  }

  @Post('send')
  @Permissions(PERMISSIONS.MESSAGES_SEND)
  async send(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendTemplateDto,
  ) {
    return this.sendTemplate.execute({
      orgId: user.orgId,
      userId: user.sub,
      channelId: dto.channelId,
      templateId: dto.templateId,
      contactPhone: dto.contactPhone,
      variables: dto.variables,
      conversationId: dto.conversationId,
      idempotencyKey: dto.idempotencyKey,
    });
  }
}
