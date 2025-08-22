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
import { SetupRadiologyUnitService } from './setup-radiology-unit.service';
import { SetupRadiologyUnit } from './entities/setup-radiology-unit.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-radiology-unit')
export class SetupRadiologyUnitController {
  constructor(
    private readonly setupRadiologyUnitService: SetupRadiologyUnitService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() unitEntity: SetupRadiologyUnit) {
    return this.setupRadiologyUnitService.create(unitEntity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findOne() {
    return this.setupRadiologyUnitService.findOne();
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() unitEntity: SetupRadiologyUnit) {
    return this.setupRadiologyUnitService.update(id, unitEntity);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupRadiologyUnitService.remove(id, Hospital_id);
  }


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Radiology_Unit")
  async findRadiologyUnitSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyUnitService.findRadiologyUnitSearch(
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
  @Get("/v3/Setup_Radiology_Unit")
  async findRadiologyUnitsSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupRadiologyUnitService.findRadiologyUnitsSearch(
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
