import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { CreatePlanDto } from '../../application/dto/create-plan.dto';
import { UpdatePlanDto } from '../../application/dto/update-plan.dto';
import { SubscribeDto, ChangePlanDto, CancelSubscriptionDto } from '../../application/dto/subscribe.dto';
import { ListInvoicesQueryDto, ListPaymentsQueryDto } from '../../application/dto/list-billing-query.dto';
import { CreateOrderDto, VerifyPaymentDto } from '../../application/dto/create-order.dto';
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import { ListPlansUseCase } from '../../application/use-cases/list-plans.use-case';
import { SubscribeUseCase } from '../../application/use-cases/subscribe.use-case';
import { ChangePlanUseCase } from '../../application/use-cases/change-plan.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { ReactivateSubscriptionUseCase } from '../../application/use-cases/reactivate-subscription.use-case';
import { GetSubscriptionUseCase } from '../../application/use-cases/get-subscription.use-case';
import { ListInvoicesUseCase, ListPaymentsUseCase } from '../../application/use-cases/list-invoices.use-case';
import { RazorpayPaymentService } from '../../domain/services/razorpay-payment.service';
import { PlanRepository } from '../../infrastructure/repositories/plan.repository';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly listPlansUseCase: ListPlansUseCase,
    private readonly subscribeUseCase: SubscribeUseCase,
    private readonly changePlanUseCase: ChangePlanUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly reactivateSubscriptionUseCase: ReactivateSubscriptionUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly razorpayPayment: RazorpayPaymentService,
    private readonly planRepo: PlanRepository,
  ) {}

  // ── Plan Management (system/admin only) ──

  @Post('plans')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_PLANS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createPlan(
    @Body() dto: CreatePlanDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.createPlanUseCase.execute(
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Patch('plans/:id')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_PLANS_MANAGE)
  async updatePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.updatePlanUseCase.execute(
      id,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Get('plans')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.BILLING_READ)
  async listPlans() {
    return this.listPlansUseCase.execute();
  }

  // ── Razorpay Payment Flow ──

  /**
   * Step 1: Create a Razorpay order before checkout.
   * Returns orderId + amount so the frontend can open the Razorpay widget.
   */
  @Post('create-order')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.BILLING_READ)
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const plan = await this.planRepo.findById(dto.planId);
    if (!plan || !plan.isActive || plan.deletedAt) {
      throw new NotFoundException('Plan not found or is no longer available');
    }
    if (plan.priceInCents === 0) {
      throw new BadRequestException('Free plans do not require a payment order');
    }

    const receiptId = `sub-${user.orgId}-${Date.now()}`;
    const order = await this.razorpayPayment.createOrder(
      plan.priceInCents,
      plan.currency,
      receiptId,
      { orgId: user.orgId, planId: dto.planId },
    );

    return {
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    };
  }

  /**
   * Step 2: Verify the Razorpay payment signature after checkout, then subscribe.
   * Frontend calls this after the Razorpay widget fires onSuccess.
   */
  @Post('verify-payment')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.BILLING_READ)
  @HttpCode(HttpStatus.CREATED)
  async verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const isValid = this.razorpayPayment.verifyPaymentSignature(
      dto.orderId,
      dto.razorpayPaymentId,
      dto.signature,
    );
    if (!isValid) {
      throw new BadRequestException('Payment verification failed: invalid signature');
    }

    return this.subscribeUseCase.execute(
      user.orgId,
      user.sub,
      {
        planId: dto.planId,
        razorpayPaymentId: dto.razorpayPaymentId,
        idempotencyKey: dto.idempotencyKey,
      },
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  // ── Subscription Management ──

  @Post('subscribe')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async subscribe(
    @Body() dto: SubscribeDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.subscribeUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Post('change-plan')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_MANAGE)
  @HttpCode(HttpStatus.OK)
  async changePlan(
    @Body() dto: ChangePlanDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.changePlanUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Post('cancel')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_MANAGE)
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Body() dto: CancelSubscriptionDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.cancelSubscriptionUseCase.execute(
      user.orgId,
      user.sub,
      dto,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Post('reactivate')
  @Roles('ADMIN')
  @Permissions(PERMISSIONS.BILLING_MANAGE)
  @HttpCode(HttpStatus.OK)
  async reactivateSubscription(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.reactivateSubscriptionUseCase.execute(
      user.orgId,
      user.sub,
      this.extractIp(req),
      this.extractUserAgent(req),
    );
  }

  @Get('subscription')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  @Permissions(PERMISSIONS.BILLING_READ)
  async getSubscription(@CurrentUser() user: JwtPayload) {
    return this.getSubscriptionUseCase.execute(user.orgId);
  }

  // ── Invoices & Payments ──

  @Get('invoices')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.BILLING_INVOICES_READ)
  async listInvoices(
    @Query() query: ListInvoicesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listInvoicesUseCase.execute(user.orgId, query);
  }

  @Get('payments')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(PERMISSIONS.BILLING_INVOICES_READ)
  async listPayments(
    @Query() query: ListPaymentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listPaymentsUseCase.execute(user.orgId, query);
  }

  private extractIp(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private extractUserAgent(req: Request): string {
    return (req.headers['user-agent'] as string) || 'unknown';
  }
}
