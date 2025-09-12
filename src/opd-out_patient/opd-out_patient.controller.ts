/* eslint-disable prettier/prettier */
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
import { OpdOutPatientService } from './opd-out_patient.service';
import { OpdOutPatient } from './entities/opd-out_patient.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('opd-out-patient')
export class OpdOutPatientController {
  constructor(private readonly opdOutPatientService: OpdOutPatientService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() opd_entity: OpdOutPatient) {
    return this.opdOutPatientService.create(opd_entity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.opdOutPatientService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/one')
  findOne(@Query('search') search: string) {
    return this.opdOutPatientService.findOne(search);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() opd_entity: OpdOutPatient) {
    return this.opdOutPatientService.update(+id, opd_entity);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hos_id') hos_id: number) {
    return this.opdOutPatientService.remove(id, hos_id);
  }

  @UseGuards(AuthGuard)
  @Get('/symptoms/:id')
  findTitleByType(@Param('id') id: number) {
    return this.opdOutPatientService.findTitleByType(id);
  }

  @UseGuards(AuthGuard)
  @Get('/symptomDescription/:id')
  findDescriptionbytitle(@Param('id') id: number) {
    return this.opdOutPatientService.findDescByOne(id);
  }

  @UseGuards(AuthGuard)
  @Get('/opdDetails/:search')
  findOpdDetailsBySearch(@Param('search') search: string) {
    return this.opdOutPatientService.findOpdDetailsBySearch(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpage/opd')
  async findAllopd(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string,
  ) {
    try {
      const final_output = await this.opdOutPatientService.findopd_details(
        limit || 10,
        page || 1,
        search,
      );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalPages: Math.ceil(final_output.total / final_output.limit),
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
          totalPages: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  //  @UseGuards(AuthGuard)
  @Get('/v3/getAllpage/opd')
  async V3findAllopd(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string,
  ) {
    try {
      const final_output: any =
        await this.opdOutPatientService.V3findopd_details(
          limit || 10,
          page || 1,
          search,
        );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.count,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: 'No opd found',
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOnebyid(
    @Param('id') id: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.opdOutPatientService.findOnebyid(id, hospital_id);
  }
}
