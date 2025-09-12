import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupPathologyPathologyParameter } from './entities/setup-pathology-pathology_parameter.entity';
import { SetupPathologyPathologyParameterService } from './setup-pathology-pathology_parameter.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pathology-pathology-parameter')
export class SetupPathologyPathologyParameterController {
  constructor(private readonly pathology_parameterService: SetupPathologyPathologyParameterService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() pathology_parameterEntity: SetupPathologyPathologyParameter) {
    return this.pathology_parameterService.create(pathology_parameterEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.pathology_parameterService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pathology_parameterService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() pathology_parameterEntity: SetupPathologyPathologyParameter) {
    return this.pathology_parameterService.update(id, pathology_parameterEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {

    const deletepatho = await this.pathology_parameterService.remove(id, Hospital_id)

    return {
      status: 'success',
      message: `id: ${id} deleted successfully`
    };
  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Pathology_Parameter")
  async findPathologyParameterSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.pathology_parameterService.findPathologyParameterSearch(
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
  @Get("/v3/Setup_Pathology_Parameter")
  async findPathologyParametersSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.pathology_parameterService.findPathologyParametersSearch(
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
