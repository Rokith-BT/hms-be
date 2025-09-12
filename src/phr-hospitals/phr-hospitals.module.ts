import { Module } from '@nestjs/common';
import { PhrHospitalsService } from './phr-hospitals.service';
import { PhrHospitalsController } from './phr-hospitals.controller';

@Module({
  controllers: [PhrHospitalsController],
  providers: [PhrHospitalsService],
})
export class PhrHospitalsModule {}
