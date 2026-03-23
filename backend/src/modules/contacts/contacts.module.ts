import { Module } from '@nestjs/common';

// Repository
import { ContactRepository } from './infrastructure/repositories/contact.repository';

// Use cases
import {
  CreateContactUseCase,
  AutoCreateContactUseCase,
  GetContactUseCase,
  ListContactsUseCase,
  UpdateContactUseCase,
  DeleteContactUseCase,
  ChangeLeadStatusUseCase,
  AssignContactUseCase,
  MergeContactsUseCase,
  AddNoteUseCase,
  GetNotesUseCase,
  AddTagUseCase,
  RemoveTagUseCase,
  GetContactHistoryUseCase,
} from './application/use-cases';

// Controller
import { ContactsController } from './interfaces/controllers/contacts.controller';

// Dependent modules
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuditModule, UsersModule],
  controllers: [ContactsController],
  providers: [
    // Repository
    ContactRepository,

    // Use cases
    CreateContactUseCase,
    AutoCreateContactUseCase,
    GetContactUseCase,
    ListContactsUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    ChangeLeadStatusUseCase,
    AssignContactUseCase,
    MergeContactsUseCase,
    AddNoteUseCase,
    GetNotesUseCase,
    AddTagUseCase,
    RemoveTagUseCase,
    GetContactHistoryUseCase,
  ],
  exports: [ContactRepository, AutoCreateContactUseCase],
})
export class ContactsModule {}
