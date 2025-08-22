import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, ParseIntPipe, HttpStatus, UseGuards, } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Billing } from './entities/billing.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() Entity: Billing) {

    return this.billingService.create(Entity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number) {
    return this.billingService.findall(patient_id);
  }
  @UseGuards(AuthGuard)
  @Get('/details')
  findome(@Query('patient_id') patient_id: number) {
    return this.billingService.findone(patient_id);
  }
  @UseGuards(AuthGuard)
  @Get('/amount')
  findamount(@Query('patient_id') patient_id: number) {
    return this.billingService.findamount(patient_id)
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_billing_details_by_ipdID')
  async findBillingDetailsByIpdId(
    @Query('ipd_id') ipd_id: number,
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

      const final_out = await this.billingService.findBillingDetailsByIpdId(
        ipd_id,
        search,
        limit,
        page,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          patientInfo: final_out.patientInfo,
          total: final_out.total,
          totalTaxAmount: final_out.totalTaxAmount,
          totalApplyCharge: final_out.totalApplyCharge,
          totalAmount: final_out.totalAmount,
          paid: final_out.paid,
          unpaid: final_out.unpaid,
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
  @Get('/v2/get_billing_details_by_opdID')
  async findBillingDetailsByOpdId(
    @Query('opd_id') opd_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!opd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'OPD ID is required',
        };
      }

      const final_out = await this.billingService.findBillingDetailsByOpdId(
        opd_id,
        search,
        limit,
        page,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          patientInfo: final_out.patientInfo,
          total: final_out.total,
          totalTaxAmount: final_out.totalTaxAmount,
          totalApplyCharge: final_out.totalApplyCharge,
          totalAmount: final_out.totalAmount,
          paid: final_out.paid,
          unpaid: final_out.unpaid,
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
  @Get('/v2/get_billing_details_by_case_reference')
  async findBillingDetailsByCaseReference(
    @Query('case_reference_id') case_reference_id: string,
    @Query('search') search?: string,
    @Query('ipd_limit', new DefaultValuePipe(10), ParseIntPipe) ipd_limit?: number,
    @Query('ipd_page', new DefaultValuePipe(1), ParseIntPipe) ipd_page?: number,
    @Query('opd_limit', new DefaultValuePipe(10), ParseIntPipe) opd_limit?: number,
    @Query('opd_page', new DefaultValuePipe(1), ParseIntPipe) opd_page?: number,
  ) {
    try {
      if (!case_reference_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Case Reference ID is required',
        };
      }

      const final_out = await this.billingService.findBillingDetailsByCaseReferenceId(
        case_reference_id,
        search,
        ipd_limit,
        ipd_page,
        opd_limit,
        opd_page,
      );

      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.SUCCESS_MESSAGE,
        data: final_out,
      };
    } catch (error) {
      console.error(error, 'Billing Error');
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }



  @UseGuards(AuthGuard)
  @Get('/v2/get_billing_details_by_patient_id')
  async findBillingDetailsByPatientId(
    @Query('patient_id') patient_id: string,
    @Query('search') search?: string,
    @Query('ipd_limit', new DefaultValuePipe(10), ParseIntPipe) ipd_limit?: number,
    @Query('ipd_page', new DefaultValuePipe(1), ParseIntPipe) ipd_page?: number,
    @Query('opd_limit', new DefaultValuePipe(10), ParseIntPipe) opd_limit?: number,
    @Query('opd_page', new DefaultValuePipe(1), ParseIntPipe) opd_page?: number,
  ) {
    try {
      if (!patient_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'Patient ID is required',
        };
      }

      const final_out = await this.billingService.findBillingDetailsByPatientId(
        patient_id,
        search,
        ipd_limit,
        ipd_page,
        opd_limit,
        opd_page,
      );

      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.SUCCESS_MESSAGE,
        data: final_out,
      };
    } catch (error) {
      console.error(error, 'Billing Error');
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }



}










