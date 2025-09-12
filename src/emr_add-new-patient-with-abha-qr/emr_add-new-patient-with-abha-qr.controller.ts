import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
// import { PatientFromQrService } from './emr_add-new-patient-with-abha-qr.service';
import { Appointment, EmrAddNewPatientWithAbhaQr, Patient } from './entities/emr_add-new-patient-with-abha-qr.entity';
import { EmrAddNewPatientWithAbhaQrservice } from './emr_add-new-patient-with-abha-qr.service';

@Controller('emr-add-new-patient-with-abha-qr')
export class EmrAddNewPatientWithAbhaQrController {
  constructor(private readonly emrAddNewPatientWithAbhaQrService: EmrAddNewPatientWithAbhaQrservice) {}

  @Post('scan')
  create(@Body() createPatientFromQr_Entity: EmrAddNewPatientWithAbhaQr) {
    console.log("controller running");
    
    return this.emrAddNewPatientWithAbhaQrService.create(createPatientFromQr_Entity);
  }

  @Post('AddNewPatient')
  create_ADD_patient(@Body() PatientEntity:Patient) {
    return this.emrAddNewPatientWithAbhaQrService.CreateManually(PatientEntity);
  }




  @Get('/getQR')
  findQR(@Query('token') token: string) {
    return this.emrAddNewPatientWithAbhaQrService.findQR(token);
  }
}