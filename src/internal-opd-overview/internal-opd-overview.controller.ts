import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdOverviewService } from './internal-opd-overview.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-overview')
export class InternalOpdOverviewController {
  constructor(private readonly internalOpdOverviewService: InternalOpdOverviewService) { }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number) {
    return this.internalOpdOverviewService.findALL(patient_id);
  }

}
