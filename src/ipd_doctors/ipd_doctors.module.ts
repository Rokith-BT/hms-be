import { Module } from '@nestjs/common';
import { IpdDoctorsService } from './ipd_doctors.service';
import { IpdDoctorsController } from './ipd_doctors.controller';

@Module({
  controllers: [IpdDoctorsController],
  providers: [IpdDoctorsService],
})
export class IpdDoctorsModule {}
