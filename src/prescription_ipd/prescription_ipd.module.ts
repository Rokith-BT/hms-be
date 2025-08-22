import { Module } from '@nestjs/common';
import { PrescriptionIpdService } from './prescription_ipd.service';
import { PrescriptionIpdController } from './prescription_ipd.controller';

@Module({
  controllers: [PrescriptionIpdController],
  providers: [PrescriptionIpdService],
})
export class PrescriptionIpdModule {}
