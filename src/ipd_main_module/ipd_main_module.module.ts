import { Module } from '@nestjs/common';
import { IpdMainModuleService } from './ipd_main_module.service';
import { IpdMainModuleController } from './ipd_main_module.controller';
import { AddAppointmentService } from 'src/add-appointment/add-appointment.service';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Module({
  controllers: [IpdMainModuleController],
  providers: [IpdMainModuleService, AddAppointmentService,FaceAuthService],
})
export class IpdMainModuleModule { }
