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
import { SetupHumanResourceDesignationService } from './setup-human_resource-designation.service';
import { SetupHumanResourceDesignation } from './entities/setup-human_resource-designation.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-designation')
export class SetupHumanResourceDesignationController {
  constructor(
    private readonly setupHumanResourceDesignationService: SetupHumanResourceDesignationService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() designationEntity: SetupHumanResourceDesignation) {
    return this.setupHumanResourceDesignationService.create(designationEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourceDesignationService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHumanResourceDesignationService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() designationEntity: SetupHumanResourceDesignation,
  ) {
    return this.setupHumanResourceDesignationService.update(
      id,
      designationEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: string) {
    return this.setupHumanResourceDesignationService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHRDesignation/:search')
  HRDesignation(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupHumanResourceDesignationService.HRDesignation(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllDesig")
  async findAllDesig(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceDesignationService.findAllDesig(
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
  @Get("/v2/SetupHRDesignation")
  async findDesignationsearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceDesignationService.findDesignationsearch(
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
