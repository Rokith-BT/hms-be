/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalModulesChargesnameAndIdService } from './internal_modules_chargesname-and-id.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-modules-chargesname-and-id')
export class InternalModulesChargesnameAndIdController {
  constructor(private readonly internalModulesChargesnameAndIdService: InternalModulesChargesnameAndIdService) { }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.internalModulesChargesnameAndIdService.findall(id);
  }
  @UseGuards(AuthGuard)
  @Get('charges/:id')
  find(@Param('id') id: number) {
    return this.internalModulesChargesnameAndIdService.findcharges(id);
  }
  @UseGuards(AuthGuard)
  @Get()
  finds() {
    return this.internalModulesChargesnameAndIdService.find_slot_name();
  }
}
