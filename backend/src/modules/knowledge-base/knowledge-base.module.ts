import { Module } from '@nestjs/common';
import { KbRepository } from './infrastructure/repositories/kb.repository';
import { DocumentProcessorService } from './domain/services/document-processor.service';
import { KbController, KbPublicController } from './interfaces/controllers/kb.controller';

@Module({
  controllers: [KbController, KbPublicController],
  providers: [KbRepository, DocumentProcessorService],
  exports: [KbRepository, DocumentProcessorService],
})
export class KnowledgeBaseModule {}
