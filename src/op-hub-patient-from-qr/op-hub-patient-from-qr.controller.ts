import { Controller, Post, Body } from '@nestjs/common';
import { OpHubPatientFromQrService } from './op-hub-patient-from-qr.service';
import { PatientFromQr, Patient } from './entities/op-hub-patient-from-qr.entity';

@Controller('op-hub-patient-from-qr')
export class OpHubPatientFromQrController {
  constructor(private readonly patientFromQrService: OpHubPatientFromQrService) { }

  @Post('scan')
  create(@Body() createPatientFromQr: PatientFromQr) {
    return this.patientFromQrService.create(createPatientFromQr);
  }

  @Post('AddNewPatient')
  AddPatient(@Body() createPatientFromQr: Patient) {
    return this.patientFromQrService.CreateManually(createPatientFromQr);
  }


  @Post('checkExistingPatient')
  patCheck(@Body() createPatientFromQr: Patient) {
    if(!createPatientFromQr.mobileno || !createPatientFromQr.patient_name || !createPatientFromQr.dob || !createPatientFromQr.gender) {
      return {
        status_code: 400,
        status: 'Failed',
        message: 'Provide all required fields: mobileno, patient_name, dob'
      }

    }
    return this.patientFromQrService.checkWithDetails(createPatientFromQr);
  }
}
