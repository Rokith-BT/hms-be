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
import { SetupSymptomsSymptomsHeadService } from './setup-symptoms-symptoms_head.service';
import { SetupSymptomsSymptomsHead } from './entities/setup-symptoms-symptoms_head.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-symptoms-symptoms-head')
export class SetupSymptomsSymptomsHeadController {
  constructor(
    private readonly setupSymptomsSymptomsHeadService: SetupSymptomsSymptomsHeadService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() symptoms_headEntity: SetupSymptomsSymptomsHead) {
    return this.setupSymptomsSymptomsHeadService.create(symptoms_headEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupSymptomsSymptomsHeadService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupSymptomsSymptomsHeadService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() symptoms_headEntity: SetupSymptomsSymptomsHead,
  ) {
    return this.setupSymptomsSymptomsHeadService.update(
      id,
      symptoms_headEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    const deletesymptoms = await this.setupSymptomsSymptomsHeadService.remove(
      id,
      Hospital_id,
    );
    return {
      status: ` success`,
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/SetupSymptomsHead/:search')
  setupSymptomsHead(@Param('search') search: string) {
    return this.setupSymptomsSymptomsHeadService.setupSymptomsHead(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/get_all_symptoms_head")
  async findAllSymptomsHead(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupSymptomsSymptomsHeadService.findAllSymptomsHead(
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
  @Get("/v2/Setup_Symptoms_Head")
  async findSymptomsHeadSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupSymptomsSymptomsHeadService.findSymptomsHeadSearch(
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
