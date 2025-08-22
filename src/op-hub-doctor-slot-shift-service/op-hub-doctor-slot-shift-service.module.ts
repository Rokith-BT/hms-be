import { Module } from '@nestjs/common';
import { OpHubDoctorSlotShiftServiceService } from './op-hub-doctor-slot-shift-service.service';
import { OpHubDoctorSlotShiftServiceController } from './op-hub-doctor-slot-shift-service.controller';

@Module({
  controllers: [OpHubDoctorSlotShiftServiceController],
  providers: [OpHubDoctorSlotShiftServiceService],
})
export class OpHubDoctorSlotShiftServiceModule {}
