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
import { SetupSymptomsSymptomsTypeService } from './setup-symptoms-symptoms_type.service';
import { SetupSymptomsSymptomsType } from './entities/setup-symptoms-symptoms_type.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-symptoms-symptoms-type')
export class SetupSymptomsSymptomsTypeController {
  constructor(
    private readonly setupSymptomsSymptomsTypeService: SetupSymptomsSymptomsTypeService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() symptoms_typeEntity: SetupSymptomsSymptomsType) {
    return this.setupSymptomsSymptomsTypeService.create(symptoms_typeEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupSymptomsSymptomsTypeService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupSymptomsSymptomsTypeService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() symptoms_typeEntity: SetupSymptomsSymptomsType,
  ) {
    return this.setupSymptomsSymptomsTypeService.update(
      id,
      symptoms_typeEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupSymptomsSymptomsTypeService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupSymptomsType/:search')
  setupSymptomsType(@Param('search') search: string) {
    return this.setupSymptomsSymptomsTypeService.setupSymptomsType(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/get_all_symptoms_type")
  async findAllSymptomsType(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupSymptomsSymptomsTypeService.findAllSymptomsType(
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
  @Get("/v2/Setup_Symptoms_Type")
  async findSymptomsTypeSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupSymptomsSymptomsTypeService.findSymptomsTypeSearch(
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
