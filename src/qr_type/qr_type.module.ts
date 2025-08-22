import { Module } from '@nestjs/common';
import { QrTypeService } from './qr_type.service';
import { QrTypeController } from './qr_type.controller';

@Module({
  controllers: [QrTypeController],
  providers: [QrTypeService],
})
export class QrTypeModule {}
