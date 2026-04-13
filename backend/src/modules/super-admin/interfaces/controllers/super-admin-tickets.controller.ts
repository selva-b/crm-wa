import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import {
  CreateTicketUseCase,
  GetTicketUseCase,
  ListTicketsUseCase,
  ReplyToTicketUseCase,
  UpdateTicketStatusUseCase,
} from '../../application/use-cases/ticket.use-cases';
import {
  CreateTicketDto,
  ReplyToTicketDto,
  UpdateTicketStatusDto,
  ListTicketsQueryDto,
} from '../../application/dto/ticket.dto';

@Controller('super-admin/tickets')
export class SuperAdminTicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly getTicketUseCase: GetTicketUseCase,
    private readonly listTicketsUseCase: ListTicketsUseCase,
    private readonly replyToTicketUseCase: ReplyToTicketUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
  ) {}

  /** Any authenticated user (org user or super admin) can create a ticket */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(@Body() dto: CreateTicketDto, @CurrentUser() user: JwtPayload) {
    return this.createTicketUseCase.execute(user.orgId, user.sub, dto);
  }

  /** List — super admin sees all; org users see their org's tickets */
  @Get()
  async listTickets(@Query() query: ListTicketsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.listTicketsUseCase.execute(query, user.orgId, user.isSuperAdmin);
  }

  @Get(':id')
  async getTicket(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.getTicketUseCase.execute(id, user.orgId, user.isSuperAdmin);
  }

  /** Both org users and super admin can reply */
  @Post(':id/replies')
  @HttpCode(HttpStatus.CREATED)
  async replyToTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyToTicketDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.isSuperAdmin ? undefined : user.sub;
    const superAdminId = user.isSuperAdmin ? user.sub : undefined;
    return this.replyToTicketUseCase.execute(id, dto, userId, superAdminId, user.orgId);
  }

  /** Only super admin can change ticket status */
  @Patch(':id/status')
  @UseGuards(SuperAdminGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.updateTicketStatusUseCase.execute(id, dto);
  }
}
