/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalOpdChargesService } from './internal-opd-charges.service';
import { InternalOpdCharge } from './entities/internal-opd-charge.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-opd-charges')
export class InternalOpdChargesController {
  constructor(private readonly internalOpdChargesService: InternalOpdChargesService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() InternalOpdChargeentity: InternalOpdCharge[]) {

    return this.internalOpdChargesService.create(InternalOpdChargeentity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query("opd_id") opd_id: number, @Query("patient_id") patient_id: number) {
    return this.internalOpdChargesService.findAll(opd_id, patient_id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() InternalOpdChargeentity: InternalOpdCharge) {
    return this.internalOpdChargesService.update(id, InternalOpdChargeentity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.internalOpdChargesService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/charges/:id')
  findcharges(@Param('id') id: string) {
    return this.internalOpdChargesService.findcharges(id);
  }
  @UseGuards(AuthGuard)
  @Get('/amount/:id')
  findAmount(@Param('id') id: number) {
    return this.internalOpdChargesService.findAmount(id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/Search')
  async findOpdChargesDetailsSearch(
    @Query('patientId') patientId: number,
    @Query('opdDetailsId') opdDetailsId: number,
    @Query('search') search: string
  ): Promise<InternalOpdCharge[]> {


    try {
      return await this.internalOpdChargesService.findOpdChargesDetailsSearch(patientId, opdDetailsId, search);
    } catch (error) {
      console.error('Error fetching charges details:', error);
      throw new Error('Failed to fetch opd charge details');
    }
  }


  @UseGuards(AuthGuard)

  @Get('/v2/getAllcharges')



  async findAllDesigById(
    @Query('patient_id') patient_id: number,
    @Query('opdDetailsId') opdDetailsId: number,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string
  ) {
    try {

      const final_output = await this.internalOpdChargesService.findOpdChargesDetailsSearchCount(
        limit || 10,
        page || 1,
        opdDetailsId,
        search || ''
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
}
