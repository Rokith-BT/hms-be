import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DischargePatientIpdModuleService } from './discharge_patient_ipd_module.service';
import { DischargePatientIpdModule } from './entities/discharge_patient_ipd_module.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('discharge-patient-ipd-module')
export class DischargePatientIpdModuleController {
  constructor(
    private readonly dischargePatientIpdModuleService: DischargePatientIpdModuleService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() DischargePatientIpdModule: DischargePatientIpdModule) {
    return this.dischargePatientIpdModuleService.create(
      DischargePatientIpdModule,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.dischargePatientIpdModuleService.findAll();
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() DischargePatientIpdModule: DischargePatientIpdModule,
  ) {
    return this.dischargePatientIpdModuleService.update(
      id,
      DischargePatientIpdModule,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.dischargePatientIpdModuleService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/ipd_discharge_patient")
  async findIpdDischargePatientSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.dischargePatientIpdModuleService.findIpdDischargePatientSearch(
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
  @Get("/v3/ipd_discharge_patient")
  async findIpdDischargePatientsSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.dischargePatientIpdModuleService.findIpdDischargePatientsSearch(
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
