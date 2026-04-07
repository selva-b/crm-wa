import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { CsatRepository } from '../../infrastructure/repositories/csat.repository';

@Controller('csat')
export class CsatController {
  constructor(private readonly csatRepo: CsatRepository) {}

  /**
   * GET /csat/stats — CSAT dashboard statistics
   */
  @Get('stats')
  @Permissions(PERMISSIONS.ANALYTICS_READ)
  async getStats(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
  ) {
    return this.csatRepo.getStats(
      user.orgId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      productId,
    );
  }

  /**
   * GET /csat/surveys — List all survey responses
   */
  @Get('surveys')
  @Permissions(PERMISSIONS.ANALYTICS_READ)
  async listSurveys(
    @CurrentUser() user: JwtPayload,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.csatRepo.list(user.orgId, {
      take: take ? parseInt(take, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      agentId,
    });
  }

  /**
   * POST /csat/send — Send a CSAT survey for a conversation (agent triggers)
   */
  @Post('send')
  @Permissions(PERMISSIONS.MESSAGES_SEND)
  @HttpCode(HttpStatus.CREATED)
  async sendSurvey(
    @CurrentUser() user: JwtPayload,
    @Body('conversationId') conversationId: string,
    @Body('contactPhone') contactPhone: string,
    @Body('channelType') channelType?: string,
  ) {
    return this.csatRepo.create({
      orgId: user.orgId,
      conversationId,
      contactPhone,
      agentId: user.sub,
      channelType,
    });
  }

  /**
   * POST /csat/respond/:conversationId — Public endpoint for customer to submit rating
   */
  @Public()
  @Post('respond/:conversationId')
  @HttpCode(HttpStatus.OK)
  async respondToSurvey(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    if (rating < 1 || rating > 5) {
      return { error: 'Rating must be between 1 and 5' };
    }
    await this.csatRepo.submitResponse(conversationId, rating, comment);
    return { success: true, message: 'Thank you for your feedback!' };
  }
}
