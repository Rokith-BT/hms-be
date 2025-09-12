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
import { OpdBillingService } from './opd_billing.service';
import { OpdBilling, OpdBillingV3 } from './entities/opd_billing.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('opd-billing')
export class OpdBillingController {
  constructor(private readonly opdBillingService: OpdBillingService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOpdBilling: OpdBilling) {
    return this.opdBillingService.create(createOpdBilling);
  }

  @UseGuards(AuthGuard)
  @Post('/AddOPDPayment')
  AddOPDPayment(@Body() createOpdBilling: OpdBilling) {
    return this.opdBillingService.AddOPDPayment(createOpdBilling);
  }

  @UseGuards(AuthGuard)
  @Post('/AddIPDPayment')
  AddIPDPayment(@Body() createOpdBilling: OpdBilling) {
    return this.opdBillingService.AddIPDPayment(createOpdBilling);
  }

  // @Get()
  // findAll() {
  //   return this.opdBillingService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.opdBillingService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createOpdBilling: OpdBilling) {
  //   return this.opdBillingService.update(+id, createOpdBilling);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.opdBillingService.remove(+id);
  // }

  @UseGuards(AuthGuard)
  @Post('/AddOPDPayment/v3')
  AddOPDPaymentv3(@Body() createOpdBilling: OpdBillingV3) {
    if (!createOpdBilling.received_by) {
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
    return this.opdBillingService.AddOPDPaymentV3(createOpdBilling);
  }

  @UseGuards(AuthGuard)
  @Post('/AddIPDPayment/v3')
  AddIPDPaymentv3(@Body() createOpdBilling: OpdBillingV3) {
    if (!createOpdBilling.received_by) {
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
    return this.opdBillingService.AddIPDPaymentV3(createOpdBilling);
  }
}
