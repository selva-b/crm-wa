import { Module } from '@nestjs/common';
import { OrgRepository } from './infrastructure/repositories/org.repository';
import { OrgService } from './domain/services/org.service';
import { GetOrgSettingsUseCase } from './application/use-cases/get-org-settings.use-case';
import { UpdateOrgSettingsUseCase } from './application/use-cases/update-org-settings.use-case';
import { OrgController } from './interfaces/controllers/org.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [OrgController],
  providers: [
    OrgRepository,
    OrgService,
    GetOrgSettingsUseCase,
    UpdateOrgSettingsUseCase,
  ],
  exports: [OrgService, OrgRepository],
})
export class OrgModule {}
