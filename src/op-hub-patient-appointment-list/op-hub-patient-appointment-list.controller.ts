import { Controller, Get, Query } from '@nestjs/common';
import { OpHubPatientAppointmentListService } from './op-hub-patient-appointment-list.service';
import { ApiProperty, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ErrorResponse500 } from 'src/op-hub-appointment-status/op-hub-appointment-status.controller';
import { ErrorResponse400 } from 'src/op-hub-appointment/entities/op-hub-appointment.entity';


export class AppointmentHistoryDto {
  @ApiProperty({ description: 'Name of the patient' })
  patient_name: string;

  @ApiProperty({ description: 'Unique identifier for the patient' })
  patient_id: number;

  @ApiProperty({ description: 'Appointment date and time' })
  appointment_date: string;

  @ApiProperty({ description: 'Appointment date in database format' })
  comp: string;

  @ApiProperty({ description: 'Mobile number of the patient' })
  Mobile: string;

  @ApiProperty({ description: 'Doctor’s specialty' })
  doctorSpecialist: string;

  @ApiProperty({ description: 'Dial code for the phone number' })
  dial_code: string;

  @ApiProperty({ description: 'Unique identifier for the doctor' })
  doctor: number;

  @ApiProperty({ description: 'Name of the consultant doctor' })
  consultant: string;

  @ApiProperty({ description: 'Current status of the appointment' })
  appointment_status: string;

  @ApiProperty({ description: 'Identifier for the appointment status' })
  appointment_status_id: string;

  @ApiProperty({ description: 'Color code representing the appointment status' })
  color_code: string;

  @ApiProperty({ description: 'Unique identifier for the appointment' })
  appointment_id: string;

  @ApiProperty({ description: 'Payment status of the appointment' })
  payment_status: string;

  @ApiProperty({ description: 'Fees for the appointment' })
  apptFees: number;

  @ApiProperty({ description: 'Unique identifier for the OPD' })
  opd_id: string;

  @ApiProperty({ description: 'Appointment token' })
  appointment_token: string;
}


@Controller('op-hub-patient-appointment-list')
export class OpHubPatientAppointmentListController {
  constructor(private readonly patientAppointmentListService: OpHubPatientAppointmentListService) { }

  @Get('/history')
  @ApiOperation({ summary: 'Retrieve appointment history for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date of the appointment', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved appointment history', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  findAll(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number) {
    return this.patientAppointmentListService.findAll(hospital_id, patient_id, date, doctor);
  }

  @Get('/upcoming')
  @ApiOperation({ summary: 'Retrieve upcoming appointments for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date for filtering upcoming appointments', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved upcoming appointments', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  findAllUpcoming(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number) {
    return this.patientAppointmentListService.findAllUpcomming(hospital_id, patient_id, date, doctor);
  }

  @Get('/today')
  @ApiOperation({ summary: 'Retrieve today\'s appointments for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date for filtering today\'s appointments', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved today appointments', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  findAllToday(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number) {
    return this.patientAppointmentListService.findAllToday(hospital_id, patient_id, date, doctor);
  }



  @Get('/v2/today')
  @ApiOperation({ summary: 'Retrieve today\'s appointments for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date for filtering today\'s appointments', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved today appointments', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAllTodayV2(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number, @Query('limit') limit: string, @Query('page') page: string) {

    if (!patient_id || !hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.HOS_AND_PAT_ERR
      }
    }
    try {
      let final_out = await this.patientAppointmentListService.findAllTodayV2(hospital_id, patient_id, date, doctor, +limit || 10, +page || 1);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: []
        }
      }
    } catch (error) {

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        "status": process.env.ERROR_STATUS_V2,
        "message": process.env.ERROR_MESSAGE_V2,
      }
    }

  }



  @Get('/v2/history')
  @ApiOperation({ summary: 'Retrieve appointment history for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date of the appointment', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved appointment history', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAllHistoryV2(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number, @Query('limit') limit: string, @Query('page') page: string) {
    if (!patient_id || !hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.HOS_AND_PAT_ERR
      }
    }
    try {
      let final_out = await this.patientAppointmentListService.findAllHistoryV2(hospital_id, patient_id, date, doctor, +limit || 10, +page || 1);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data:[]
        }
      }
    } catch (error) {
      console.log(error, "error");

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        "status": process.env.ERROR_STATUS_V2,
        "message": process.env.ERROR_MESSAGE_V2,
      }
    }
  }


  @Get('/v2/upcoming')
  @ApiOperation({ summary: 'Retrieve upcoming appointments for a patient' })
  @ApiQuery({ name: 'hospital_id', required: true, description: 'ID of the hospital', type: Number })
  @ApiQuery({ name: 'patient_id', required: true, description: 'ID of the patient', type: Number })
  @ApiQuery({ name: 'date', required: false, description: 'Date for filtering upcoming appointments', type: String })
  @ApiQuery({ name: 'doctor', required: false, description: 'ID of the doctor', type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved upcoming appointments', type: [AppointmentHistoryDto] })

  @ApiResponse({
    status: 404,
    description: 'Patient charge not found.',
  })

  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500
  })
  async findAllUpcomingV2(@Query('hospital_id') hospital_id: number, @Query('patient_id') patient_id: number,
    @Query('date') date: any, @Query('doctor') doctor: number, @Query('limit') limit: string, @Query('page') page: string) {
    try {
      let final_out = await this.patientAppointmentListService.findAllUpcommingV2(hospital_id, patient_id, date, doctor, +limit || 10, +page || 1);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data:[]
        }
      }
    } catch (error) {
      console.log(error, "error");

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        "status": process.env.ERROR_STATUS_V2,
        "message": process.env.ERROR_MESSAGE_V2,
      }
    }
  }
}
