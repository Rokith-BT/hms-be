/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdTreatmentHistory } from './entities/internal-opd-treatment-history.entity';
import { InternalOpdTreatmentHistoryService } from './internal-opd-treatment-history.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-treatment-history')
export class InternalOpdTreatmentHistoryController {
  constructor(private readonly internalOpdTreatmentHistoryService: InternalOpdTreatmentHistoryService) { }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number) {
    return this.internalOpdTreatmentHistoryService.findAll(patient_id);
  }
  @UseGuards(AuthGuard)
  @Get('id')
  findOne(@Query('patient_id') patient_id: number, @Query('opd_details_id') opd_details_id: number) {
    return this.internalOpdTreatmentHistoryService.findOne(patient_id, opd_details_id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findTreatmentHistorySearch(
    @Query('patientId') patientId: number,
    @Query('search') search: string
  ): Promise<InternalOpdTreatmentHistory[]> {


    try {
      return await this.internalOpdTreatmentHistoryService.findTreatmentHistorySearch(patientId, search);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch treatment history details');
    }
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAlltreatment')
  async findalltreatment(@Query('patient_id') patient_id: number, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {

    try {
      let final_output = await this.internalOpdTreatmentHistoryService.treatmentfindall(

        limit || 10,
        page || 1,
        patient_id,
        search || ''

      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit)
        }
      }

      return this.internalOpdTreatmentHistoryService.treatmentfindall(patient_id, limit, page, search)
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }


}
