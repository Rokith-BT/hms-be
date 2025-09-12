import { Module } from '@nestjs/common';
import { OpHubDoctorsService } from './op-hub-doctors.service';
import { OpHubDoctorsController } from './op-hub-doctors.controller';

@Module({
  controllers: [OpHubDoctorsController],
  providers: [OpHubDoctorsService],
})
export class OpHubDoctorsModule {}
