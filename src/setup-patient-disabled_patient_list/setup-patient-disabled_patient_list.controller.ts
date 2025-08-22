/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupPatientDisabledPatientListService } from './setup-patient-disabled_patient_list.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-patient-disabled-patient-list')
export class SetupPatientDisabledPatientListController {
  constructor(private readonly setupPatientDisabledPatientListService: SetupPatientDisabledPatientListService) { }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPatientDisabledPatientListService.findAll();
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.setupPatientDisabledPatientListService.update(id, data)
  }
  @UseGuards(AuthGuard)
  @Get("/v2/Setup_disable_patient")
  async findDisablePatientSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPatientDisabledPatientListService.findDisablePatientSearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }

  @UseGuards(AuthGuard)
  @Get("/v3/Setup_disable_patient")
  async findDisablePatientsSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPatientDisabledPatientListService.findDisablePatientsSearch(
        search,
        limit || 10,
        page || 1
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }

  }


}