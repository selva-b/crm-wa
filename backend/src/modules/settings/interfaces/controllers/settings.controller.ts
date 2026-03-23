import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { ManageSettingsUseCase } from '../../application/use-cases/manage-settings.use-case';
import { ManageFeatureFlagsUseCase } from '../../application/use-cases/manage-feature-flags.use-case';
import { ManageIntegrationsUseCase } from '../../application/use-cases/manage-integrations.use-case';
import { ManageWebhooksUseCase } from '../../application/use-cases/manage-webhooks.use-case';
import {
  CreateSettingDto,
  UpdateSettingDto,
  ListSettingsQueryDto,
  ResolveSettingQueryDto,
} from '../../application/dto/setting.dto';
import {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  ListFeatureFlagsQueryDto,
  ResolveFeatureFlagQueryDto,
} from '../../application/dto/feature-flag.dto';
import {
  CreateIntegrationConfigDto,
  UpdateIntegrationConfigDto,
} from '../../application/dto/integration-config.dto';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  ListWebhookDeliveriesQueryDto,
} from '../../application/dto/webhook.dto';

interface JwtPayload {
  userId: string;
  orgId: string;
  role: string;
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly manageSettings: ManageSettingsUseCase,
    private readonly manageFeatureFlags: ManageFeatureFlagsUseCase,
    private readonly manageIntegrations: ManageIntegrationsUseCase,
    private readonly manageWebhooks: ManageWebhooksUseCase,
  ) {}

  // ═══════════════════════════════════════════════
  // SETTINGS (Key-Value Configuration)
  // ═══════════════════════════════════════════════

  @Get('config')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async listSettings(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListSettingsQueryDto,
  ) {
    return this.manageSettings.list(user.orgId, query);
  }

  @Get('config/resolve')
  @Permissions(PERMISSIONS.SETTINGS_READ)
  async resolveSetting(
    @CurrentUser() user: JwtPayload,
    @Query() query: ResolveSettingQueryDto,
  ) {
    return this.manageSettings.resolve(user.orgId, query.category, query.key);
  }

  @Post('config')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async createSetting(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSettingDto,
    @Req() req: Request,
  ) {
    return this.manageSettings.create(
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch('config/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  async updateSetting(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSettingDto,
    @Req() req: Request,
  ) {
    return this.manageSettings.update(
      id,
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete('config/:id')
  @Permissions(PERMISSIONS.SETTINGS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSetting(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    await this.manageSettings.delete(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ═══════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════

  @Get('feature-flags')
  @Permissions(PERMISSIONS.FEATURE_FLAGS_READ)
  async listFeatureFlags(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListFeatureFlagsQueryDto,
  ) {
    return this.manageFeatureFlags.list(user.orgId, query);
  }

  @Get('feature-flags/resolve/:featureKey')
  @Permissions(PERMISSIONS.FEATURE_FLAGS_READ)
  async resolveFeatureFlag(
    @Param('featureKey') featureKey: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.manageFeatureFlags.resolve(user.orgId, featureKey);
  }

  @Post('feature-flags')
  @Permissions(PERMISSIONS.FEATURE_FLAGS_MANAGE)
  async createFeatureFlag(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFeatureFlagDto,
    @Req() req: Request,
  ) {
    return this.manageFeatureFlags.create(
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch('feature-flags/:id')
  @Permissions(PERMISSIONS.FEATURE_FLAGS_MANAGE)
  async updateFeatureFlag(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateFeatureFlagDto,
    @Req() req: Request,
  ) {
    return this.manageFeatureFlags.update(
      id,
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete('feature-flags/:id')
  @Permissions(PERMISSIONS.FEATURE_FLAGS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeatureFlag(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    await this.manageFeatureFlags.delete(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ═══════════════════════════════════════════════
  // INTEGRATION CONFIGS
  // ═══════════════════════════════════════════════

  @Get('integrations')
  @Permissions(PERMISSIONS.INTEGRATIONS_READ)
  async listIntegrations(@CurrentUser() user: JwtPayload) {
    return this.manageIntegrations.list(user.orgId);
  }

  @Get('integrations/:id')
  @Permissions(PERMISSIONS.INTEGRATIONS_READ)
  async getIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.manageIntegrations.getById(id, user.orgId);
  }

  @Post('integrations')
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  async createIntegration(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateIntegrationConfigDto,
    @Req() req: Request,
  ) {
    return this.manageIntegrations.create(
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch('integrations/:id')
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  async updateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateIntegrationConfigDto,
    @Req() req: Request,
  ) {
    return this.manageIntegrations.update(
      id,
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete('integrations/:id')
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    await this.manageIntegrations.delete(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('integrations/:id/test')
  @Permissions(PERMISSIONS.INTEGRATIONS_MANAGE)
  async testIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.manageIntegrations.test(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // ═══════════════════════════════════════════════
  // WEBHOOKS
  // ═══════════════════════════════════════════════

  @Get('webhooks')
  @Permissions(PERMISSIONS.WEBHOOKS_READ)
  async listWebhooks(@CurrentUser() user: JwtPayload) {
    return this.manageWebhooks.list(user.orgId);
  }

  @Get('webhooks/:id')
  @Permissions(PERMISSIONS.WEBHOOKS_READ)
  async getWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.manageWebhooks.getById(id, user.orgId);
  }

  @Get('webhooks/:id/deliveries')
  @Permissions(PERMISSIONS.WEBHOOKS_READ)
  async listWebhookDeliveries(
    @Param('id', ParseUUIDPipe) webhookId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: ListWebhookDeliveriesQueryDto,
  ) {
    return this.manageWebhooks.listDeliveries(webhookId, user.orgId, query);
  }

  @Post('webhooks')
  @Permissions(PERMISSIONS.WEBHOOKS_MANAGE)
  async createWebhook(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateWebhookDto,
    @Req() req: Request,
  ) {
    return this.manageWebhooks.create(
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch('webhooks/:id')
  @Permissions(PERMISSIONS.WEBHOOKS_MANAGE)
  async updateWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateWebhookDto,
    @Req() req: Request,
  ) {
    return this.manageWebhooks.update(
      id,
      user.orgId,
      user.userId,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete('webhooks/:id')
  @Permissions(PERMISSIONS.WEBHOOKS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    await this.manageWebhooks.delete(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('webhooks/:id/test')
  @Permissions(PERMISSIONS.WEBHOOKS_MANAGE)
  async testWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.manageWebhooks.test(
      id,
      user.orgId,
      user.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
