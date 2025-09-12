import { Controller, Get, Post, Body, Patch, Query } from '@nestjs/common';
import { OpHubPatientProfileService } from './op-hub-patient-profile.service';
import {
  Patientprofile,
  ABHAProfile,
} from './entities/op-hub-patient-profile.entity';

@Controller('op-hub-patient-profile')
export class OpHubPatientProfileController {
  constructor(
    private readonly patientprofileService: OpHubPatientProfileService,
  ) {}

  @Get()
  async getPatientDetails(
    @Query('patientId') patientId: number,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.getPatientDetails(patientId, hospital_id);
  }

  @Patch()
  updateStatus(
    @Query('patientId') patientId: number,
    @Body() Entity: Patientprofile,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.updatePatientDetails(
      patientId,
      Entity,
      hospital_id,
    );
  }

  @Patch('/abha-address')
  updateabhaAddress(
    @Query('patientId') patientId: number,
    @Body() Entity: Patientprofile,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.updatePatientABHAaddress(
      patientId,
      Entity,
      hospital_id,
    );
  }

  @Patch('/abha-number')
  updateabhaNumber(
    @Query('patientId') patientId: number,
    @Body() Entity: ABHAProfile,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.updatePatientABHANumber(
      patientId,
      Entity,
      hospital_id,
    );
  }
  @Patch('/verify-abha-number')
  updateVerifyabhaNumber(
    @Query('patientId') patientId: number,
    @Body() Entity: ABHAProfile,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.updatePatientVerifyABHANumber(
      patientId,
      Entity,
      hospital_id,
    );
  }
  @Post('/get-registration-status')
  getRegistrationStatus(
    @Body() Entity: any,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.patientprofileService.getRegistrationStatus(
      Entity,
      hospital_id,
    );
  }

  @Patch('/update-abha-number')
  updateNumber(
    @Query('aayush_unique_id') aayush_unique_id: any,
    @Query('abhaNumber') abhaNumber: any,
  ) {
    return this.patientprofileService.updateOnlyAbhaNumber(
      aayush_unique_id,
      abhaNumber,
    );
  }
}
