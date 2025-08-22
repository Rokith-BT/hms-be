import { Controller, Post, Body } from '@nestjs/common';
import { OpHubGetAbhaAddressOfPatientService } from './op-hub-get-abha-address-of-patient.service';

@Controller('op-hub-get-abha-address-of-patient')
export class OpHubGetAbhaAddressOfPatientController {
  constructor(private readonly getAbhaAddressOfPatientService: OpHubGetAbhaAddressOfPatientService) { }

  @Post()
  findAll(@Body('patient_id') patient_id: number) {
    return this.getAbhaAddressOfPatientService.findAll(patient_id);
  }
}
