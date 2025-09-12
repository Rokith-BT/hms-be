import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupRadiologyRadiologyParameterService } from './setup-radiology-radiology_parameter.service';
import { SetupRadiologyRadiologyParameter } from './entities/setup-radiology-radiology_parameter.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-radiology-radiology-parameter')
export class SetupRadiologyRadiologyParameterController {
  constructor(private readonly setupRadiologyRadiologyParameterService: SetupRadiologyRadiologyParameterService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() radiology_parameterEntity: SetupRadiologyRadiologyParameter) {
    return this.setupRadiologyRadiologyParameterService.create(radiology_parameterEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupRadiologyRadiologyParameterService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupRadiologyRadiologyParameterService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() radiology_parameterEntity: SetupRadiologyRadiologyParameter) {
    return this.setupRadiologyRadiologyParameterService.update(id, radiology_parameterEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupRadiologyRadiologyParameterService.remove(id, Hospital_id);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Radiology_Parameter")
  async findRadiologyParameterSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyRadiologyParameterService.findRadiologyParameterSearch(
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
  @Get("/v3/Setup_Radiology_Parameter")
  async findRadiologyParametersSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyRadiologyParameterService.findRadiologyParametersSearch(
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
