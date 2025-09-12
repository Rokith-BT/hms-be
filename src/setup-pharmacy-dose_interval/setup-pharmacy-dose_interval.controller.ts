import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupPharmacyDoseIntervalService } from './setup-pharmacy-dose_interval.service';
import { SetupPharmacyDoseInterval } from './entities/setup-pharmacy-dose_interval.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pharmacy-dose-interval')
export class SetupPharmacyDoseIntervalController {
  constructor(private readonly setupPharmacyDoseIntervalService: SetupPharmacyDoseIntervalService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dose_intervalEntity: SetupPharmacyDoseInterval) {
    return this.setupPharmacyDoseIntervalService.create(dose_intervalEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPharmacyDoseIntervalService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPharmacyDoseIntervalService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dose_intervalEntity: SetupPharmacyDoseInterval) {
    return this.setupPharmacyDoseIntervalService.update(id, dose_intervalEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupPharmacyDoseIntervalService.remove(id, Hospital_id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/setupPharmacyDoseInterval/:search')
  setupPharmacyDoseInterval(@Param('search') search: string) {

    return this.setupPharmacyDoseIntervalService.setupPharmacyDoseInterval(search);
  }



}
