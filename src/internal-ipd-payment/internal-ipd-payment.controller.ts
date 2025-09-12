import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InternalIpdPaymentService } from './internal-ipd-payment.service';
import {
  InternalIpdPayment,
  InternalIpdPaymentV2,
} from './entities/internal-ipd-payment.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-ipd-payment')
export class InternalIpdPaymentController {
  constructor(
    private readonly internalIpdPaymentService: InternalIpdPaymentService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createInternalIpdPayment: InternalIpdPayment) {
    return this.internalIpdPaymentService.create(createInternalIpdPayment);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('patient_id') patient_id: number,
    @Query('ipd_id') ipd_id: number,
  ) {
    return this.internalIpdPaymentService.findALL(patient_id, ipd_id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createInternalIpdPayment: InternalIpdPayment,
  ) {
    return this.internalIpdPaymentService.update(id, createInternalIpdPayment);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hos_id') hos_id: number) {
    return this.internalIpdPaymentService.remove(id, hos_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findIpdPaymentDetailsSearch(
    @Query('patientId') patientId: number,
    @Query('ipdDetailsId') ipdDetailsId: number,
    @Query('search') search: string,
  ): Promise<InternalIpdPayment[]> {
    try {
      return await this.internalIpdPaymentService.findIpdPaymentDetailsSearch(
        patientId,
        ipdDetailsId,
        search,
      );
    } catch (error) {
      throw new Error('Failed to fetch ipd payment details');
    }
  }
  @UseGuards(AuthGuard)
  @Get('/v2/get_ipd_payments')
  async findIpdPaymentDetails(
    @Query('ipd_id') ipd_id: number,
    @Query('patient_id') patient_id: number,
    @Query('hospital_id') hospital_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }

      const final_out =
        await this.internalIpdPaymentService.findIpdPaymentDetails(
          ipd_id,
          patient_id,
          hospital_id,
          search,
          limit || 10,
          page || 1,
        );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Get('/v3/get_ipd_payments')
  async findIpdPaymentDetail(
    @Query('ipd_id') ipd_id: number,
    @Query('patient_id') patient_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }

      const final_out =
        await this.internalIpdPaymentService.findIpdPaymentDetail(
          ipd_id,
          patient_id,
          search,
          limit || 10,
          page || 1,
        );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Post('/v2')
  V2create(@Body() createInternalIpdPayment: InternalIpdPaymentV2) {
    if (
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() != 'cash' &&
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() != 'card' &&
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() !=
        'net_banking' &&
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() != 'upi'
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: 'Enter Correct Payment Method',
      };
    }
    if (!createInternalIpdPayment.received_by_name) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
      };
    }
    if (!createInternalIpdPayment.payment_method) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() == 'card' &&
      !createInternalIpdPayment.card_division &&
      !createInternalIpdPayment.card_bank_name &&
      !createInternalIpdPayment.card_type &&
      !createInternalIpdPayment.card_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }

    if (
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() ==
        'net_banking' &&
      !createInternalIpdPayment.net_banking_division &&
      !createInternalIpdPayment.net_banking_transaction_id
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    if (
      createInternalIpdPayment.payment_mode.toLocaleLowerCase() == 'upi' &&
      !createInternalIpdPayment.upi_id &&
      !createInternalIpdPayment.upi_transaction_id &&
      !createInternalIpdPayment.upi_bank_name
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAMS_MISSING_V2,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING,
      };
    }
    return this.internalIpdPaymentService.V2create(createInternalIpdPayment);
  }


  @UseGuards(AuthGuard)
  @Get('/v2/get_ipd_balance')
  async getIpdBalance(@Query('ipd_id') ipd_id: number) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: process.env.IPD_VALIDATE_MESSAGE,
        };
      }
  
      const balanceData = await this.internalIpdPaymentService.getIpdBalanceAmount(ipd_id);
  
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
