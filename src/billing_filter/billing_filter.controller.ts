import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BillingFilterService } from './billing_filter.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('billing-filter')
export class BillingFilterController {
  constructor(private readonly billingFilterService: BillingFilterService) {}

@UseGuards(AuthGuard)
  @Get()
  findAll(@Query('date') date:any,
     @Query('fromDate') fromDate:any,
     @Query('todate') todate:any,
     @Query('patient_id') patient_id:number,
     @Query('payment_method') payment_method:string
) {
    return this.billingFilterService.findAll(date,fromDate,todate,patient_id,payment_method);
  }

  
}
