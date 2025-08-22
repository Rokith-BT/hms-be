import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddAppointmentService } from './add-appointment.service';
import {
  AddAppointment,
  AddAppointmentPayment,
} from './entities/add-appointment.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('add-appointment')
export class AddAppointmentController {
  constructor(private readonly addAppointmentService: AddAppointmentService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() add_appointment: AddAppointment) {
    add_appointment.payment_mode =
      add_appointment.payment_mode.toLocaleLowerCase();
    if (
      add_appointment.payment_mode != 'cash' &&
      add_appointment.payment_mode != 'card' &&
      add_appointment.payment_mode != 'upi' &&
      add_appointment.payment_mode != 'neft' &&
      add_appointment.payment_mode != 'paylater' &&
      add_appointment.payment_mode != 'online' &&
      add_appointment.payment_mode != 'net_banking'
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message:
          'Invalid payment mode. Please use one of the following: cash, card, upi, neft, paylater,online.',
      };
    }
    return this.addAppointmentService.create(add_appointment);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.addAppointmentService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Query('hospital_id') hospital_id: number) {
    return this.addAppointmentService.findOne(id, hospital_id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() add_appointment: AddAppointment) {
    add_appointment.payment_mode =
      add_appointment.payment_mode.toLocaleLowerCase();

    if (
      add_appointment.payment_mode != 'cash' &&
      add_appointment.payment_mode != 'card' &&
      add_appointment.payment_mode != 'upi' &&
      add_appointment.payment_mode != 'neft' &&
      add_appointment.payment_mode != 'paylater' &&
      add_appointment.payment_mode != 'online' &&
      add_appointment.payment_mode != 'net_banking'
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message:
          'Invalid payment mode. Please use one of the following: cash, card, upi, neft, paylater,online.',
      };
    }
    return this.addAppointmentService.update(+id, add_appointment);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hos_id') hos_id: number) {
    return this.addAppointmentService.remove(id, hos_id);
  }

  @UseGuards(AuthGuard)
  @Post('set-status-to-approved')
  async setStatusToApproved(
    @Body('appointment_id') appointment_id: number,
    @Body('hos_id') hos_id: number,
  ) {
    return await this.addAppointmentService.set_status_to_approved(
      appointment_id,
      hos_id,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/summa/cancel/:id')
  cancelAppointment(
    @Param('id') id: string, // Parameter for the appointment ID
    @Body() add_appointment: AddAppointment, // Body parameter with cancellation details
  ) {
    return this.addAppointmentService.cancelAppointment(id, add_appointment);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpage')
  async findAllDesig(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
    @Query('hospital_id') hosp_id?: number,
  ) {
    try {
      const final_output = await this.addAppointmentService.findappointment(
        limit || 10,
        page || 1,
        filter,
        search,
        hosp_id,
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalPages: Math.ceil(final_output.total / final_output.limit),
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No appointments found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
          totalPages: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v3/getAllpage')
  async V3findAllDesig(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
    @Query('hospital_id') hosp_id?: number,
  ) {
    try {
      if (!filter) {
        return {
          status_code: process.env.ERROR_STATUS_CODE,
          status: process.env.ERROR_STATUS,
          message: process.env.ERROR_MESSAGE_PARAM_MISSING,
        };
      }
      const filterArray = filter.split('|');
      for (const filterItem of filterArray) {
        const [key, value] = filterItem.split(':');
        if (key.toLowerCase() != 'period') {
          return {
            status_code: process.env.ERROR_STATUS_CODE,
            status: process.env.ERROR_STATUS,
            message: process.env.ERROR_MESSAGE_PARAM_MISSING,
          };
        }
      }
      const final_output: any =
        await this.addAppointmentService.V3findappointment(
          limit || 10,
          page || 1,
          filter,
          search,
          hosp_id,
        );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No appointments found',
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Post('/update-appt-payment')
  async paymentUpdate(
    @Query('appointment_id') appointment_id: number,
    @Body() add_appointment_payment: AddAppointmentPayment,
  ) {
    if (!appointment_id) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Appointment ID is required',
      };
    }
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
    return this.addAppointmentService.updatePaymentDetails(
      appointment_id,
      add_appointment_payment,
    );
  }

  // @UseGuards(AuthGuard)
  @Get('/get-pat-pending/appointments')
  async getPendingAppts(@Query('aayush_unique_id') aayush_unique_id: number) {
    try {
      if (!aayush_unique_id) {
        return {
          statusCode: 400,
          status: process.env.ERROR_STATUS,
          message: process.env.ERROR_MESSAGE_PARAM_MISSING,
        };
      }

      return await this.addAppointmentService.getPatAppoint(aayush_unique_id);
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }
}
