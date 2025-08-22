import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReferralPaymentService } from './referral_payment.service';
import { ReferralPayment } from './entities/referral_payment.entity';
import { query } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('referral-payment')
export class ReferralPaymentController {
  constructor(private readonly referralPaymentService: ReferralPaymentService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createReferralPayment: ReferralPayment) {
    return this.referralPaymentService.create(createReferralPayment);
  }




  @UseGuards(AuthGuard)
  @Get('/opdidcaseid/:patient_id')
  findopdidcaseid(@Param('patient_id') patient_id: number, @Query('section') section: string) {
    return this.referralPaymentService.findopdidcaseid(patient_id, section);
  }


  @UseGuards(AuthGuard)
  @Get('/patientBillAmount')
  findrefPatBillAmount(@Query('opd_id') opd_id: string, @Query('case_reference_id') case_reference_id: string) {
    return this.referralPaymentService.findrefPatBillAmount(opd_id, case_reference_id);
  }

  @UseGuards(AuthGuard)
  @Get('commission')
  async getCommissionAmount(
    @Query('id') id: number,
    @Query('amount') amount: number,
  ) {
    return this.referralPaymentService.getCommissionAmount(id, amount);
  }

  @UseGuards(AuthGuard)

  @Get()
  findAll() {
    return this.referralPaymentService.findAll();
  }


  @UseGuards(AuthGuard)
  @Get('/referralPayment/:search')
  ReferralPaymentSearch(@Param('search') search: string) {

    return this.referralPaymentService.ReferralPaymentSearch(search);
  }


  @UseGuards(AuthGuard)
  @Delete()
  async remove(@Query('referral_payment_id') referral_payment_id: string, @Query('Hospital_id') Hospital_id: number) {

    const deletereferral_payment = await this.referralPaymentService.remove(referral_payment_id, Hospital_id);
    return {
      status: `success`,
      message: `id: ${referral_payment_id} deleted successfully`
    }

  }



  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createReferralPayment: ReferralPayment) {
    return this.referralPaymentService.update(id, createReferralPayment);
  }




}
