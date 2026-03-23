import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { UpdateOrgSettingsDto } from '../../application/dto';
import { GetOrgSettingsUseCase } from '../../application/use-cases/get-org-settings.use-case';
import { UpdateOrgSettingsUseCase } from '../../application/use-cases/update-org-settings.use-case';

@Controller('org')
export class OrgController {
  constructor(
    private readonly getOrgSettingsUseCase: GetOrgSettingsUseCase,
    private readonly updateOrgSettingsUseCase: UpdateOrgSettingsUseCase,
  ) {}

  @Get('settings')
  @Permissions(PERMISSIONS.ORG_READ)
  async getSettings(@CurrentUser() user: JwtPayload) {
    return this.getOrgSettingsUseCase.execute(user.orgId);
  }

  @Patch('settings')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.ORG_UPDATE)
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrgSettingsDto,
    @Req() req: Request,
  ) {
    return this.updateOrgSettingsUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
