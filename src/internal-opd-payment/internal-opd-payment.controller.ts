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
import { InternalOpdPaymentService } from './internal-opd-payment.service';
import {
  InternalOpdPayment,
  InternalOpdPaymentv3,
} from './entities/internal-opd-payment.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-payment')
export class InternalOpdPaymentController {
  constructor(
    private readonly internalOpdPaymentService: InternalOpdPaymentService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() InternalOpdPayment: InternalOpdPayment) {
    return this.internalOpdPaymentService.create(InternalOpdPayment);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('patient_id') patient_id: number,
    @Query('opd_id') opd_id: number,
    // @Query('appointment_id') appointment_id: number,
  ) {
    return this.internalOpdPaymentService.findALL(patient_id, opd_id);
  }

  // @Patch(':id')
  // update(@Param('id') id:string, @Body() InternalOpdPayment: InternalOpdPayment){
  //   return this.internalOpdPaymentService.update(id, InternalOpdPayment);
  // }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hos_id') hos_id: number) {
    return this.internalOpdPaymentService.remove(id, hos_id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findOpdPaymentDetailsSearch(
    @Query('patientId') patientId: number,
    @Query('opdDetailsId') opdDetailsId: number,
    @Query('search') search: string,
  ): Promise<InternalOpdPayment[]> {
    try {
      return await this.internalOpdPaymentService.findOpdPaymentDetailsSearch(
        patientId,
        opdDetailsId,
        search,
      );
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch opd payment details');
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllopdpayment')
  async findAlldesigopd_payment(
    @Query('patient_id') patient_id: number,
    // @Query('appointment_id') appointment_id:number,
    @Query('opdDetailsId') opdDetailsId: number,
    @Query('hospital_id') hospital_id: number,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string,
  ) {
    try {
      const final_output = await this.internalOpdPaymentService.findopdpayment(
        limit || 10,
        page || 1,
        patient_id,
        //  appointment_id,
        opdDetailsId,
        hospital_id,
        search || '',
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No opd found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
        };
      }
    } catch (error) {
      console.error('Error fetching visit details:', error);
      throw new Error('Failed to fetch ocid visit details');
    }
  }

  @UseGuards(AuthGuard)
  @Post('/v2')
  createv3(@Body() createOpdBilling: InternalOpdPaymentv3) {
    if (
      createOpdBilling.payment_mode.toLocaleLowerCase() != 'cash' &&
      createOpdBilling.payment_mode.toLocaleLowerCase() != 'card' &&
      createOpdBilling.payment_mode.toLocaleLowerCase() != 'net_banking' &&
      createOpdBilling.payment_mode.toLocaleLowerCase() != 'upi'
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Enter Correct Payment Method',
      };
    }
    if (!createOpdBilling.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
      };
    }
    if (!createOpdBilling.payment_method) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createOpdBilling.payment_mode.toLocaleLowerCase() == 'card' &&
      !createOpdBilling.card_division &&
      !createOpdBilling.card_bank_name &&
      !createOpdBilling.card_type &&
      !createOpdBilling.card_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }

    if (
      createOpdBilling.payment_mode.toLocaleLowerCase() == 'net_banking' &&
      !createOpdBilling.net_banking_division &&
      !createOpdBilling.net_banking_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createOpdBilling.payment_mode.toLocaleLowerCase() == 'upi' &&
      !createOpdBilling.upi_id &&
      !createOpdBilling.upi_transaction_id &&
      !createOpdBilling.upi_bank_name
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    return this.internalOpdPaymentService.createv2(createOpdBilling);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_opd_balance')
  async getOpdBalance(@Query('opd_id') opd_id: number) {
    try {
      if (!opd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: process.env.OPD_VALIDATE_MESSAGE,
        };
      }

      const balanceData =
        await this.internalOpdPaymentService.getOpdBalance(opd_id);

      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.BALANCE_FETCH_MESSAGE,
        balance_amount: balanceData.balance,
      };
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }
}
