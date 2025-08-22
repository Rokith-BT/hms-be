import { Module } from '@nestjs/common';
import { OpHubInternalAppntDoctorsService } from './op-hub-internal-appnt-doctors.service';
import { OpHubInternalAppntDoctorsController } from './op-hub-internal-appnt-doctors.controller';

@Module({
  controllers: [OpHubInternalAppntDoctorsController],
  providers: [OpHubInternalAppntDoctorsService],
})
export class OpHubInternalAppntDoctorsModule {}
