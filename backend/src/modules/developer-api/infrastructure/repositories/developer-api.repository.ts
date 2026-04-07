import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { MessageDirection, MessageStatus, Prisma } from '@prisma/client';

@Injectable()
export class DeveloperApiRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List messages for an org with cursor-based pagination.
   */
  async listMessages(
    orgId: string,
    options: {
      limit: number;
      cursor?: string;
      direction?: string;
      status?: string;
    },
  ) {
    const where: Prisma.MessageWhereInput = {
      orgId,
      deletedAt: null,
    };

    if (options.direction) {
      where.direction = options.direction as MessageDirection;
    }
    if (options.status) {
      where.status = options.status as MessageStatus;
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: options.limit + 1, // Fetch one extra to check for next page
      ...(options.cursor && {
        cursor: { id: options.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        direction: true,
        type: true,
        body: true,
        mediaUrl: true,
        status: true,
        contactPhone: true,
        whatsappMessageId: true,
        idempotencyKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = messages.length > options.limit;
    const data = hasMore ? messages.slice(0, options.limit) : messages;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, nextCursor, hasMore };
  }

  /**
   * Get a single message by ID and org.
   */
  async getMessageById(id: string, orgId: string) {
    return this.prisma.message.findFirst({
      where: { id, orgId, deletedAt: null },
      select: {
        id: true,
        direction: true,
        type: true,
        body: true,
        mediaUrl: true,
        status: true,
        contactPhone: true,
        whatsappMessageId: true,
        idempotencyKey: true,
        createdAt: true,
        updatedAt: true,
        events: {
          select: { id: true, status: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * List contacts for an org.
   */
  async listContacts(orgId: string, limit: number, cursor?: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { orgId, deletedAt: null },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        leadStatus: true,
        source: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = contacts.length > limit;
    const data = hasMore ? contacts.slice(0, limit) : contacts;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, nextCursor, hasMore };
  }

  /**
   * Create a contact via developer API.
   */
  async createContact(data: {
    orgId: string;
    name: string;
    phoneNumber: string;
    email?: string;
    metadata?: Record<string, unknown>;
  }) {
    // Check for existing contact with same phone in org
    const existing = await this.prisma.contact.findFirst({
      where: { orgId: data.orgId, phoneNumber: data.phoneNumber, deletedAt: null },
    });

    if (existing) {
      return { contact: existing, created: false };
    }

    // Find first admin user in org as default owner
    const owner = await this.prisma.user.findFirst({
      where: { orgId: data.orgId, role: 'ADMIN', deletedAt: null },
      select: { id: true },
    });

    const contact = await this.prisma.contact.create({
      data: {
        orgId: data.orgId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        source: 'API',
        ownerId: owner!.id,
        metadata: data.metadata ? (data.metadata as any) : undefined,
      },
    });

    return { contact, created: true };
  }

  /**
   * Get active WhatsApp sessions for an org.
   */
  async getActiveSessions(orgId: string) {
    return this.prisma.whatsAppSession.findMany({
      where: { orgId, deletedAt: null },
      select: {
        id: true,
        phoneNumber: true,
        status: true,
        lastActiveAt: true,
        lastHeartbeatAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get first connected session for org (for sending messages).
   */
  async getFirstConnectedSession(orgId: string) {
    return this.prisma.whatsAppSession.findFirst({
      where: { orgId, status: 'CONNECTED', deletedAt: null },
      select: { id: true, phoneNumber: true, userId: true },
    });
  }

  /**
   * Get developer dashboard stats.
   */
  async getDashboardStats(orgId: string) {
    const [
      totalMessages,
      messagesSentThisMonth,
      totalContacts,
      activeWebhooks,
      activeSessions,
      apiKeys,
    ] = await Promise.all([
      this.prisma.message.count({ where: { orgId, deletedAt: null } }),
      this.prisma.message.count({
        where: {
          orgId,
          direction: 'OUTBOUND',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          deletedAt: null,
        },
      }),
      this.prisma.contact.count({ where: { orgId, deletedAt: null } }),
      this.prisma.webhook.count({ where: { orgId, enabled: true, deletedAt: null } }),
      this.prisma.whatsAppSession.count({ where: { orgId, status: 'CONNECTED', deletedAt: null } }),
      this.prisma.apiKey.count({ where: { orgId, isActive: true } }),
    ]);

    // Get usage record for current period
    const usageRecord = await this.prisma.usageRecord.findFirst({
      where: {
        orgId,
        metricType: 'MESSAGES_SENT',
        periodEnd: { gte: new Date() },
      },
      orderBy: { periodStart: 'desc' },
    });

    return {
      totalMessages,
      messagesSentThisMonth,
      messagesLimit: usageRecord?.limitValue ?? 0,
      messagesUsed: usageRecord?.currentValue ?? messagesSentThisMonth,
      totalContacts,
      activeWebhooks,
      activeSessions,
      activeApiKeys: apiKeys,
    };
  }

  /**
   * Get API call logs (recent messages sent via API).
   */
  async getApiLogs(orgId: string, limit: number, cursor?: string) {
    const logs = await this.prisma.message.findMany({
      where: {
        orgId,
        direction: 'OUTBOUND',
        deletedAt: null,
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contactPhone: true,
        type: true,
        status: true,
        body: true,
        createdAt: true,
      },
    });

    const hasMore = logs.length > limit;
    const data = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { data, nextCursor, hasMore };
  }
}
