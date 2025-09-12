import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OpHubAppointmentService } from './op-hub-appointment.service';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PostAppointment,
  SuccessResponse,
  ErrorResponse400,
  ErrorResponse500,
  UpdateStatusResponse200,
  StatusChangePatch,
  UpdateAppointmentResponse,
  UpdateAppointment,
  CancelAppointmentResponse200,
  CancelAppointment,
  chargeout,
  UpdateAppointmentcharge,
  AddAppointmentPayment,
} from './entities/op-hub-appointment.entity';
@ApiTags('appointment')
@Controller('op-hub-appointment')
export class OpHubAppointmentController {
  constructor(private readonly appointmentService: OpHubAppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiBody({
    description: 'Details of the appointment to be created',
    type: PostAppointment,
  })
  @ApiResponse({
    status: 201,
    description: 'The appointment has been successfully created.',
    type: SuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  create(@Body() entity: PostAppointment) {
    if (!entity.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.HOSPITAL_ID_ERR,
      };
    }
    return this.appointmentService.create(entity);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  findAll(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.appointmentService.findAll(
      fromDate,
      toDate,
      doctorId,
      appointStatus,
      hospital_id,
      paymentStatus,
    );
  }

  @Get('/history')
  @ApiOperation({ summary: 'Retrieve appointment history based on filters' })
  @ApiResponse({
    status: 200,
    description: 'Appointment history retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  findAllHistory(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.appointmentService.findAllHistory(
      fromDate,
      toDate,
      doctorId,
      appointStatus,
      hospital_id,
      paymentStatus,
    );
  }

  @Get('/Today')
  @ApiOperation({
    summary: 'Retrieve appointment Today appointments based on filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment Today appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  Today(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.appointmentService.Today(
      fromDate,
      toDate,
      doctorId,
      appointStatus,
      hospital_id,
      paymentStatus,
    );
  }

  @Get('/info')
  @ApiOperation({
    summary: 'Retrieve appointment information based on token and hospital ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment information retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  findOne(
    @Query('token') token: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.appointmentService.findOne(token, hospital_id);
  }

  @Get('/getQR')
  @ApiOperation({
    summary: 'Retrieve QR code information based on token and hospital ID',
  })
  @ApiResponse({
    status: 200,
    description: 'QR code information retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'QR code not found.',
  })
  findQR(
    @Query('token') token: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.appointmentService.findQR(token, hospital_id);
  }

  @Patch('/status/:id')
  @ApiOperation({ summary: 'Update the status of an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment status has been successfully updated.',
    type: UpdateStatusResponse200,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  updateStatus(@Param('id') id: string, @Body() entity: StatusChangePatch) {
    return this.appointmentService.updateStatus(id, entity);
  }

  @Post('/reshedule/:id')
  @ApiOperation({ summary: 'Resheduling appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment resheduleld successfully',
    type: UpdateAppointmentResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  update(@Param('id') id: string, @Body() Entity: UpdateAppointment) {
    if (!Entity.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.HOSPITAL_ID_ERR,
      };
    }
    return this.appointmentService.reshedule(id, Entity);
  }

  @Patch('/cancel/:id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiResponse({
    status: 200,
    description: 'The appointment has been successfully canceled.',
    type: CancelAppointmentResponse200,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  cancelAppointment(
    @Param('id') id: string,
    @Body() entity: CancelAppointment,
  ) {
    return this.appointmentService.cancelAppointment(id, entity);
  }

  @Patch('/add-or-discount-charges/:id')
  @ApiOperation({
    summary:
      'Add or update additional charges and discounts for an appointment',
  })
  @ApiResponse({
    status: 200,
    description: 'Charges updated successfully.',
    type: chargeout,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  remove(@Param('id') id: string, @Body() entity: UpdateAppointmentcharge) {
    return this.appointmentService.updateChargeDetails(+id, entity);
  }

  @Post('/updatePaymentDetails')
  @ApiOperation({
    summary:
      'Add or update additional charges and discounts for an appointment',
  })
  @ApiResponse({
    status: 200,
    description: 'Charges updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
    type: ErrorResponse400,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponse500,
  })
  makePayment(
    @Query('transaction_id') id: string,
    @Body() entity: PostAppointment,
  ) {
    if (!entity.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.HOSPITAL_ID_ERR,
      };
    }
    return this.appointmentService.makepayment(entity, id);
  }

  @Get('v2/upcoming-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllUpcomingV2(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out = await this.appointmentService.V2findAllUpcoming(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      console.log(error, 'error');

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('v2/today-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllTodayV2(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out = await this.appointmentService.V2findAllToday(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('v2/history-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllhistoryV2(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out = await this.appointmentService.V2findAllHistory(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('v3/upcoming-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllUpcomingV3(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out: any = await this.appointmentService.V3findAllUpcoming(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details?.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      console.log(error, 'error');

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('v3/history-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllHistoryV3(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out: any = await this.appointmentService.V3findAllHistory(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      console.log(final_out?.details, 'final_out?.details');

      if (final_out?.details?.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      console.log(error, 'error');

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Get('v3/today-appointment')
  @ApiOperation({ summary: 'Retrieve all appointments based on filters' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or missing parameters.',
  })
  async findAllTodayV3(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('doctorId') doctorId: number,
    @Query('appointStatus') appointStatus: string,
    @Query('payment_status') paymentStatus: string,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    if (!hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.HOSPITAL_ID_ERR_V2,
      };
    }
    try {
      let final_out: any = await this.appointmentService.V3findAllToday(
        fromDate,
        toDate,
        doctorId,
        appointStatus,
        hospital_id,
        paymentStatus,
        +limit || 10,
        +page || 1,
      );
      if (final_out?.details?.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2,
          data: [],
        };
      }
    } catch (error) {
      console.log(error, 'error');

      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        status: process.env.ERROR_STATUS_V2,
        message: process.env.ERROR_MESSAGE_V2,
      };
    }
  }

  @Post('/update-appt-payment')
  async paymentUpdate(
    @Query('appointment_id') appointment_id: string,
    @Body() add_appointment_payment: AddAppointmentPayment,
  ) {
    if (!appointment_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Appointment ID is required',
      };
    }
    appointment_id = appointment_id.replace(/[^\d]/g, '');
    if (
      add_appointment_payment.payment_mode.toLocaleLowerCase() != 'cash' &&
      add_appointment_payment.payment_mode.toLocaleLowerCase() != 'card' &&
      add_appointment_payment.payment_mode.toLocaleLowerCase() !=
        'net_banking' &&
      add_appointment_payment.payment_mode.toLocaleLowerCase() != 'upi'
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Enter Correct Payment Method',
      };
    }
    if (!add_appointment_payment.Hospital_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Enter Hospital ID',
      };
    }
    if (!add_appointment_payment.payment_method) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      add_appointment_payment.payment_mode.toLocaleLowerCase() == 'card' &&
      !add_appointment_payment.card_division &&
      !add_appointment_payment.card_bank_name &&
      !add_appointment_payment.card_type &&
      !add_appointment_payment.card_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }

    if (
      add_appointment_payment.payment_mode.toLocaleLowerCase() ==
        'net_banking' &&
      !add_appointment_payment.net_banking_division &&
      !add_appointment_payment.net_banking_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      add_appointment_payment.payment_mode.toLocaleLowerCase() == 'upi' &&
      !add_appointment_payment.upi_id &&
      !add_appointment_payment.upi_transaction_id &&
      !add_appointment_payment.upi_bank_name
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    return this.appointmentService.updatePaymentDetails(
      appointment_id,
      add_appointment_payment,
    );
  }
}
