import { Controller, Post, Body } from '@nestjs/common';
import { OpHubUnlinkAbhaFromPatientService } from './op-hub-unlink-abha-from-patient.service';
import { UnlinkAbhaFromPatient } from './entities/op-hub-unlink-abha-from-patient.entity';

@Controller('op-hub-unlink-abha-from-patient')
export class OpHubUnlinkAbhaFromPatientController {
  constructor(private readonly unlinkAbhaFromPatientService: OpHubUnlinkAbhaFromPatientService) { }

  @Post()
  create(@Body() createUnlinkAbhaFromPatientDto: UnlinkAbhaFromPatient) {
    return this.unlinkAbhaFromPatientService.create(createUnlinkAbhaFromPatientDto);
  }
}
