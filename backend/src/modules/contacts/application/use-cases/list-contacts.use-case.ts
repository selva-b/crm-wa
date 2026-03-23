import { Injectable } from '@nestjs/common';
import {
  ContactRepository,
  ContactWithRelations,
} from '../../infrastructure/repositories/contact.repository';
import { ListContactsQueryDto } from '../dto/list-contacts-query.dto';

export interface ListContactsResult {
  contacts: ContactWithRelations[];
  total: number;
  take: number;
  skip: number;
}

@Injectable()
export class ListContactsUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(
    orgId: string,
    query: ListContactsQueryDto,
  ): Promise<ListContactsResult> {
    const { contacts, total } = await this.contactRepository.findByOrgPaginated(
      orgId,
      {
        take: query.take,
        skip: query.skip,
        leadStatus: query.leadStatus,
        ownerId: query.ownerId,
        source: query.source,
        tagIds: query.tagIds,
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    return {
      contacts,
      total,
      take: query.take ?? 50,
      skip: query.skip ?? 0,
    };
  }
}
