import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async search(
    @CurrentUser() user: JwtPayload,
    @Query('q') query: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { contacts: [], conversations: [], campaigns: [] };
    }

    const q = query.trim();
    const orgId = user.orgId;

    const [contacts, conversations, campaigns] = await Promise.all([
      // Search contacts by name, phone, email
      this.prisma.contact.findMany({
        where: {
          orgId,
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phoneNumber: { contains: q } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          email: true,
          leadStatus: true,
          source: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),

      // Search conversations by contact phone or last message body
      this.prisma.conversation.findMany({
        where: {
          orgId,
          deletedAt: null,
          OR: [
            { contactPhone: { contains: q } },
            { lastMessageBody: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          contactId: true,
          contactPhone: true,
          lastMessageAt: true,
          lastMessageBody: true,
          status: true,
        },
        take: 5,
        orderBy: { lastMessageAt: 'desc' },
      }),

      // Search campaigns by name
      this.prisma.campaign.findMany({
        where: {
          orgId,
          deletedAt: null,
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          status: true,
          totalRecipients: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { contacts, conversations, campaigns };
  }
}
