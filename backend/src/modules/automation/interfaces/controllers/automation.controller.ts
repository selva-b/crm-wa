import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
  ListAutomationRulesDto,
  ListExecutionLogsDto,
} from '../../application/dto';
import {
  CreateAutomationRuleUseCase,
  UpdateAutomationRuleUseCase,
  ToggleAutomationRuleUseCase,
  DeleteAutomationRuleUseCase,
  GetAutomationRuleUseCase,
  ListAutomationRulesUseCase,
  ListExecutionLogsUseCase,
} from '../../application/use-cases';

@Controller('automation')
export class AutomationController {
  constructor(
    private readonly createRuleUseCase: CreateAutomationRuleUseCase,
    private readonly updateRuleUseCase: UpdateAutomationRuleUseCase,
    private readonly toggleRuleUseCase: ToggleAutomationRuleUseCase,
    private readonly deleteRuleUseCase: DeleteAutomationRuleUseCase,
    private readonly getRuleUseCase: GetAutomationRuleUseCase,
    private readonly listRulesUseCase: ListAutomationRulesUseCase,
    private readonly listExecutionLogsUseCase: ListExecutionLogsUseCase,
  ) {}

  @Post('rules')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_CREATE)
  @HttpCode(HttpStatus.CREATED)
  async createRule(
    @Body() dto: CreateAutomationRuleDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.createRuleUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Get('rules')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.AUTOMATION_READ)
  async listRules(
    @Query() dto: ListAutomationRulesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listRulesUseCase.execute(user.orgId, dto);
  }

  @Get('rules/:id')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.AUTOMATION_READ)
  async getRule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.getRuleUseCase.execute(id, user.orgId);
  }

  @Patch('rules/:id')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_UPDATE)
  async updateRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutomationRuleDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.updateRuleUseCase.execute(
      id,
      user.orgId,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Post('rules/:id/enable')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_UPDATE)
  @HttpCode(HttpStatus.OK)
  async enableRule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.toggleRuleUseCase.execute(
      id,
      user.orgId,
      user.sub,
      true,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Post('rules/:id/disable')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_UPDATE)
  @HttpCode(HttpStatus.OK)
  async disableRule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.toggleRuleUseCase.execute(
      id,
      user.orgId,
      user.sub,
      false,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Delete('rules/:id')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    await this.deleteRuleUseCase.execute(
      id,
      user.orgId,
      user.sub,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Get('logs')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.AUTOMATION_LOGS_READ)
  async listExecutionLogs(
    @Query() dto: ListExecutionLogsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listExecutionLogsUseCase.execute(user.orgId, dto);
  }

  private extractIp(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private extractUserAgent(req: Request): string {
    return (req.headers['user-agent'] as string) || 'unknown';
  }
}
