import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class WidgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrgId(orgId: string) {
    return this.prisma.widgetConfig.findUnique({ where: { orgId } });
  }

  async findByOrgSlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
    if (!org) return null;

    const config = await this.prisma.widgetConfig.findUnique({
      where: { orgId: org.id },
    });

    return config ? { ...config, orgName: org.name, orgSlug: org.slug } : null;
  }

  async upsert(orgId: string, data: {
    enabled?: boolean;
    position?: string;
    primaryColor?: string;
    welcomeMessage?: string;
    placeholder?: string;
    companyName?: string | null;
    avatarUrl?: string | null;
    whatsappNumber?: string | null;
  }) {
    return this.prisma.widgetConfig.upsert({
      where: { orgId },
      create: { orgId, ...data },
      update: data,
    });
  }
}
