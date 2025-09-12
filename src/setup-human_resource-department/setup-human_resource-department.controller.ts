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
import { SetupHumanResourceDepartmentService } from './setup-human_resource-department.service';
import { SetupHumanResourceDepartment } from './entities/setup-human_resource-department.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-human-resource-department')
export class SetupHumanResourceDepartmentController {
  constructor(
    private readonly setupHumanResourceDepartmentService: SetupHumanResourceDepartmentService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() departmentEntity: SetupHumanResourceDepartment) {
    return this.setupHumanResourceDepartmentService.create(departmentEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupHumanResourceDepartmentService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupHumanResourceDepartmentService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() departmentEntity: SetupHumanResourceDepartment,
  ) {
    return this.setupHumanResourceDepartmentService.update(
      id,
      departmentEntity,
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('Hospital_id') Hospital_id: number,
  ) {
    const deletedepart = await this.setupHumanResourceDepartmentService.remove(
      id,
      Hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/SetupHRDepartment/:search')
  HRDepartment(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupHumanResourceDepartmentService.HRDepartment(search);
  }
  @UseGuards(AuthGuard)
  @Get("/v2/getAllDepart")
  async findAllDepart(
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceDepartmentService.findAllDepart(
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
  @Get("/v2/SetupHRDepartment")
  async findDepartmentsearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupHumanResourceDepartmentService.findDepartmentsearch(
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
