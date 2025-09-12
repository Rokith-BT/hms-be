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
import { SetupHumanResourceLeaveTypesService } from './setup-human_resource-leave_types.service';
import { SetupHumanResourceLeaveType } from './entities/setup-human_resource-leave_type.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-leave-types')
export class SetupHumanResourceLeaveTypesController {
  constructor(
    private readonly setupHumanResourceLeaveTypesService: SetupHumanResourceLeaveTypesService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() leavetypesEntity: SetupHumanResourceLeaveType) {
    return this.setupHumanResourceLeaveTypesService.create(leavetypesEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourceLeaveTypesService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHumanResourceLeaveTypesService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() leavetypesEntity: SetupHumanResourceLeaveType,
  ) {
    return this.setupHumanResourceLeaveTypesService.update(
      id,
      leavetypesEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number, @Query('Hospital_id') Hospital_id) {
    return this.setupHumanResourceLeaveTypesService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHRLeaveTypes/:search')
  HRLeaveTypes(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupHumanResourceLeaveTypesService.HRLeaveTypes(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/getAllLeaveTypes")
  async findAllLeaveTypes(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceLeaveTypesService.findAllLeaveTypes(
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
  @Get("/v2/SetupHRLeaveTypes")
  async findLeaveTypesearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceLeaveTypesService.findLeaveTypesearch(
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
