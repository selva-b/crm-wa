import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/modules/rbac/domain/permissions.constants';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { CreateProductDto, UpdateProductDto, AssignProductDto } from '../../application/dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly repo: ProductRepository) {}

  @Post()
  @Permissions(PERMISSIONS.CONTACTS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser('orgId') orgId: string, @Body() dto: CreateProductDto) {
    return this.repo.create({ orgId, ...dto });
  }

  @Get()
  @Permissions(PERMISSIONS.CONTACTS_READ)
  async list(@CurrentUser('orgId') orgId: string) {
    return this.repo.findByOrg(orgId);
  }

  // Static routes BEFORE parameterized :id routes
  @Post('assign')
  @Permissions(PERMISSIONS.CONTACTS_CREATE)
  async assign(@CurrentUser('orgId') orgId: string, @Body() dto: AssignProductDto) {
    return this.repo.assignToContact(dto.contactId, dto.productId, orgId);
  }

  @Delete('unassign')
  @Permissions(PERMISSIONS.CONTACTS_CREATE)
  @HttpCode(HttpStatus.OK)
  async unassign(@Body() dto: AssignProductDto) {
    await this.repo.removeFromContact(dto.contactId, dto.productId);
    return { success: true };
  }

  @Get('by-contact/:contactId')
  @Permissions(PERMISSIONS.CONTACTS_READ)
  async getContactProducts(
    @CurrentUser('orgId') orgId: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    return this.repo.findByContact(contactId, orgId);
  }

  // Parameterized routes
  @Get(':id')
  @Permissions(PERMISSIONS.CONTACTS_READ)
  async getOne(@CurrentUser('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    const product = await this.repo.findByIdAndOrg(id, orgId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CONTACTS_CREATE)
  async update(
    @CurrentUser('orgId') orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.repo.findByIdAndOrg(id, orgId);
    if (!product) throw new NotFoundException('Product not found');
    return this.repo.update(id, dto as any);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CONTACTS_CREATE)
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser('orgId') orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    const product = await this.repo.findByIdAndOrg(id, orgId);
    if (!product) throw new NotFoundException('Product not found');
    await this.repo.softDelete(id);
    return { success: true };
  }
}
