import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '@/common/constants';

@Injectable()
export class ProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(data: { orgId: string; name: string; description?: string }) {
    return this.prisma.product.create({
      data: { orgId: data.orgId, name: data.name, description: data.description || null },
    });
  }

  async findByOrg(orgId: string) {
    return this.prisma.product.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdAndOrg(id: string, orgId: string) {
    return this.prisma.product.findFirst({
      where: { id, orgId, deletedAt: null },
    });
  }

  async update(id: string, data: { name?: string; description?: string; status?: any }) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async assignToContact(contactId: string, productId: string, orgId: string) {
    const result = await this.prisma.contactProduct.create({
      data: { contactId, productId, orgId },
    });
    this.eventEmitter.emit(EVENT_NAMES.CONTACT_PRODUCT_ASSIGNED, { contactId, productId, orgId });
    return result;
  }

  async removeFromContact(contactId: string, productId: string) {
    const items = await this.prisma.contactProduct.findMany({ where: { contactId, productId }, select: { orgId: true } });
    await this.prisma.contactProduct.deleteMany({ where: { contactId, productId } });
    if (items.length > 0) {
      this.eventEmitter.emit(EVENT_NAMES.CONTACT_PRODUCT_REMOVED, { contactId, productId, orgId: items[0].orgId });
    }
  }

  async findByContact(contactId: string, orgId: string) {
    const items = await this.prisma.contactProduct.findMany({
      where: { contactId, orgId, product: { deletedAt: null } },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((cp) => cp.product);
  }
}
