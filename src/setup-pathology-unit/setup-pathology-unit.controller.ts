import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupPathologyUnitService } from './setup-pathology-unit.service';
import { SetupPathologyUnit } from './entities/setup-pathology-unit.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-pathology-unit')
export class SetupPathologyUnitController {
  constructor(private readonly setupPathologyUnitService: SetupPathologyUnitService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() unitEntity: SetupPathologyUnit) {
    return this.setupPathologyUnitService.create(unitEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPathologyUnitService.findAll();
  }


  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() unitEntity: SetupPathologyUnit) {
    return this.setupPathologyUnitService.update(id, unitEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupPathologyUnitService.remove(id, Hospital_id);
  }


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Pathology_Unit")
  async findPathologyUnitSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPathologyUnitService.findPathologyUnitSearch(
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
  @Get("/v3/Setup_Pathology_Unit")
  async findPathologyUnitsSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupPathologyUnitService.findPathologyUnitsSearch(
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
