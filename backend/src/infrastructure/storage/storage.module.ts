import { Module } from '@nestjs/common';
import { AuthModule } from '@/modules/auth/auth.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
})
export class StorageModule {}
