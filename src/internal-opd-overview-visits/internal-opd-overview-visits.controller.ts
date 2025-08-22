/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdOverviewVisitsService } from './internal-opd-overview-visits.service';
import { InternalOpdOverviewVisit } from './entities/internal-opd-overview-visit.entity'
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-overview-visits')
export class InternalOpdOverviewVisitsController {
  constructor(private readonly internalOpdOverviewVisitsService: InternalOpdOverviewVisitsService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() InternalOpdOverviewVisit: InternalOpdOverviewVisit) {
    return this.internalOpdOverviewVisitsService.create(InternalOpdOverviewVisit);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('patient_id') patient_id: number, @Query('opd_details_id') opd_details_id: number) {
    return this.internalOpdOverviewVisitsService.findAll(patient_id, opd_details_id);
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internalOpdOverviewVisitsService.findone(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() InternalOpdOverviewVisit: InternalOpdOverviewVisit) {
    return this.internalOpdOverviewVisitsService.update(+id, InternalOpdOverviewVisit);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async remove(@Param('id') id: number, @Query('Hospital_id') Hospital_id: number): Promise<{ status: string; message: string }> {

    const deletevisit = await this.internalOpdOverviewVisitsService.remove(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }




  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findVisitDetailsSearch(
    @Query('patientId') patientId: number,
    @Query('opdDetailsId') opdDetailsId: number,
    @Query('search') search: string
  ): Promise<InternalOpdOverviewVisit[]> {


    try {
      return await this.internalOpdOverviewVisitsService.findVisitDetailsSearch(patientId, opdDetailsId, search);
    } catch (error) {
      console.error('Error fetching visit details:', error);
      throw new Error('Failed to fetch visit details');
    }
  }





  @UseGuards(AuthGuard)
  @Get('/v2/getAllpage')
  async findAllDesig(
    @Query('patient_id') patient_id: number,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string

  ) {
    try {
      const final_output = await this.internalOpdOverviewVisitsService.opd_visit(
        patient_id,
        limit || 10,
        page || 1,
        search
      );


      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalPages: Math.ceil(final_output.total / final_output.limit)
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No opd found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
        };

      }
    } catch (error) {

      throw new Error('Failed to fetch visit details');
    }
  }



  @UseGuards(AuthGuard)
  @Get('/v2/getAllpagess')
  async findAllDesigById(
    @Query('patient_id') patient_id: number,
    @Query('opd_details_id') opd_details_id: number,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string
  ) {
    try {

      const final_output = await this.internalOpdOverviewVisitsService.opd_OCID(
        patient_id,
        opd_details_id,
        limit || 10,
        page || 1,
        search
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit)
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No opd found',
          data: [],
          total: 0,
          limit: limit,
          page: page,
        };
      }

    } catch (error) {

      throw new Error('Failed to fetch ocid visit details');
    }
  }



  @UseGuards(AuthGuard)
  @Get(':id')
  findOnes(@Param('id') opd_details_id: number) {
    return this.internalOpdOverviewVisitsService.opd_visit_info(opd_details_id);
  }


  @UseGuards(AuthGuard)
  @Get('ocid/:id')
  findonesById(@Param('id') id: number) {

    return this.internalOpdOverviewVisitsService.checkup_id_ocid(id);
  }
}