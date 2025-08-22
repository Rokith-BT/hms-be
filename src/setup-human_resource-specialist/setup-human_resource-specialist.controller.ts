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
import { SetupHumanResourceSpecialistService } from './setup-human_resource-specialist.service';
import { SetupHumanResourceSpecialist } from './entities/setup-human_resource-specialist.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-specialist')
export class SetupHumanResourceSpecialistController {
  constructor(
    private readonly setupHumanResourceSpecialistService: SetupHumanResourceSpecialistService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() specialsitEntity: SetupHumanResourceSpecialist) {
    return this.setupHumanResourceSpecialistService.create(specialsitEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourceSpecialistService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHumanResourceSpecialistService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() specialsitEntity: SetupHumanResourceSpecialist,
  ) {
    return this.setupHumanResourceSpecialistService.update(
      id,
      specialsitEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hospital_id') hospital_id: string) {
    return this.setupHumanResourceSpecialistService.remove(id, hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHRSpecialist/:search')
  HRSpecialist(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupHumanResourceSpecialistService.HRSpecialist(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllSpec")
  async findAllSpec(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceSpecialistService.findAllSpec(
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
  @Get("/v2/SetupHRSpecialist")
  async findSpecialistsearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceSpecialistService.findSpecialistsearch(
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
