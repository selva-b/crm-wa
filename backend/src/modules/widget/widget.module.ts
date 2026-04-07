import { Module } from '@nestjs/common';
import { WidgetRepository } from './infrastructure/repositories/widget.repository';
import { WidgetAdminController, WidgetPublicController } from './interfaces/controllers/widget.controller';

@Module({
  controllers: [WidgetAdminController, WidgetPublicController],
  providers: [WidgetRepository],
  exports: [WidgetRepository],
})
export class WidgetModule {}
