import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HospitalChargesService } from './hospital_charges.service';
import { HospitalCharge } from './entities/hospital_charge.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('hospital-charges')
export class HospitalChargesController {
  constructor(private readonly hospitalChargesService: HospitalChargesService) { }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() hos_chargesEntity: HospitalCharge) {

    return this.hospitalChargesService.update(id, hos_chargesEntity);

  }
  @UseGuards(AuthGuard)
  @Get('/hos_amount/:plenome_id')
  findall(@Param('plenome_id') plenome_id: string) {
    return this.hospitalChargesService.findall(plenome_id);
  }




}
