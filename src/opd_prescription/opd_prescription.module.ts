import { Module } from '@nestjs/common';
import { OpdPrescriptionService } from './opd_prescription.service';
import { OpdPrescriptionController } from './opd_prescription.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [OpdPrescriptionController],
  providers: [OpdPrescriptionService, DynamicDatabaseService],
})
export class OpdPrescriptionModule { }
