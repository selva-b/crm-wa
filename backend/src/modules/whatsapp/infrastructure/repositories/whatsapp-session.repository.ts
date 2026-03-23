import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { WhatsAppSessionStatus } from '@prisma/client';

export interface CreateSessionInput {
  orgId: string;
  userId: string;
  idempotencyKey?: string;
}

export interface UpdateSessionStatusInput {
  status: WhatsAppSessionStatus;
  phoneNumber?: string;
  encryptedCreds?: string;
  lastActiveAt?: Date;
  lastHeartbeatAt?: Date;
  reconnectCount?: number;
  disconnectedAt?: Date;
}

@Injectable()
export class WhatsAppSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSessionInput) {
    return this.prisma.whatsAppSession.create({
      data: {
        orgId: input.orgId,
        userId: input.userId,
        status: WhatsAppSessionStatus.CONNECTING,
        idempotencyKey: input.idempotencyKey || null,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.whatsAppSession.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByIdAndOrg(id: string, orgId: string) {
    return this.prisma.whatsAppSession.findFirst({
      where: { id, orgId, deletedAt: null },
    });
  }

  async findActiveByUserId(userId: string, orgId: string) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return this.prisma.whatsAppSession.findFirst({
      where: {
        userId,
        orgId,
        deletedAt: null,
        OR: [
          { status: WhatsAppSessionStatus.CONNECTED },
          { status: WhatsAppSessionStatus.RECONNECTING, phoneNumber: { not: null } },
          { status: WhatsAppSessionStatus.CONNECTING, createdAt: { gt: fiveMinutesAgo } },
        ],
      },
    });
  }

  async findByIdempotencyKey(key: string) {
    return this.prisma.whatsAppSession.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async updateStatus(id: string, input: UpdateSessionStatusInput) {
    return this.prisma.whatsAppSession.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.encryptedCreds !== undefined && { encryptedCreds: input.encryptedCreds }),
        ...(input.lastActiveAt !== undefined && { lastActiveAt: input.lastActiveAt }),
        ...(input.lastHeartbeatAt !== undefined && { lastHeartbeatAt: input.lastHeartbeatAt }),
        ...(input.reconnectCount !== undefined && { reconnectCount: input.reconnectCount }),
        ...(input.disconnectedAt !== undefined && { disconnectedAt: input.disconnectedAt }),
      },
    });
  }

  async updateHeartbeat(id: string) {
    return this.prisma.whatsAppSession.update({
      where: { id },
      data: {
        lastHeartbeatAt: new Date(),
        lastActiveAt: new Date(),
      },
    });
  }

  async incrementReconnectCount(id: string) {
    return this.prisma.whatsAppSession.update({
      where: { id },
      data: {
        reconnectCount: { increment: 1 },
        status: WhatsAppSessionStatus.RECONNECTING,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.whatsAppSession.update({
      where: { id },
      data: {
        status: WhatsAppSessionStatus.DISCONNECTED,
        disconnectedAt: new Date(),
        deletedAt: new Date(),
        encryptedCreds: null,
      },
    });
  }

  async disconnectSession(id: string) {
    return this.prisma.whatsAppSession.update({
      where: { id },
      data: {
        status: WhatsAppSessionStatus.DISCONNECTED,
        disconnectedAt: new Date(),
        encryptedCreds: null,
      },
    });
  }

  async findByOrgIdPaginated(
    orgId: string,
    options: {
      status?: WhatsAppSessionStatus;
      userId?: string;
      page: number;
      limit: number;
    },
  ) {
    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
    };
    if (options.status) where.status = options.status;
    if (options.userId) where.userId = options.userId;

    const [data, total] = await Promise.all([
      this.prisma.whatsAppSession.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.whatsAppSession.count({ where }),
    ]);

    return { data, total, page: options.page, limit: options.limit };
  }

  async findStaleConnectedSessions(heartbeatThreshold: Date) {
    return this.prisma.whatsAppSession.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [WhatsAppSessionStatus.CONNECTED, WhatsAppSessionStatus.RECONNECTING],
        },
        lastHeartbeatAt: { lt: heartbeatThreshold },
      },
    });
  }

  async countActiveByOrg(orgId: string) {
    return this.prisma.whatsAppSession.count({
      where: {
        orgId,
        deletedAt: null,
        status: { not: WhatsAppSessionStatus.DISCONNECTED },
      },
    });
  }

  async findAllActive() {
    return this.prisma.whatsAppSession.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [WhatsAppSessionStatus.CONNECTED, WhatsAppSessionStatus.RECONNECTING],
        },
        encryptedCreds: { not: null },
        phoneNumber: { not: null },
      },
      select: {
        id: true,
        userId: true,
        orgId: true,
        phoneNumber: true,
      },
    });
  }
}
