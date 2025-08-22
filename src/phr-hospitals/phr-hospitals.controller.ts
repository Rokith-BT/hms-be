import { Controller, Get, Param, Query } from '@nestjs/common';
import { PhrHospitalsService } from './phr-hospitals.service';

@Controller('phr-hospitals')
export class PhrHospitalsController {
  constructor(private readonly phrHospitalsService: PhrHospitalsService) { }
  @Get('appointment-history/:patient_id')
  async getHospitalAppointmentHistoryById(@Param('patient_id') patient_id: number, @Query('hospitalId') hospitalId: number) {
    const appointmentHistory = await this.phrHospitalsService.getHospitalAppointmentHistoryById(patient_id, hospitalId);
    return appointmentHistory;
  }
  @Get('/v2/appointment-history/:patient_id')
  async getHospitalAppointmentHistoryByIdList(@Param('patient_id') patient_id: number, @Query('hospitalId') hospitalId: number, @Query("limit") limit?: string, @Query("page") page?: string) {
    const appointmentHistory = await this.phrHospitalsService.getHospitalAppointmentHistoryByIdList(patient_id, hospitalId, +limit || 10, +page || 1);
    return appointmentHistory;
  }
}
