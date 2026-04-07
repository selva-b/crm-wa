import { Module } from '@nestjs/common';
import { PipelineRepository } from './infrastructure/repositories/pipeline.repository';
import { DealRepository } from './infrastructure/repositories/deal.repository';
import { DealsController } from './interfaces/controllers/deals.controller';

@Module({
  controllers: [DealsController],
  providers: [PipelineRepository, DealRepository],
  exports: [PipelineRepository, DealRepository],
})
export class DealsModule {}
