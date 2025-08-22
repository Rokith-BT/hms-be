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
import { HumanResourceStaffService } from './human_resource_staff.service';
import { HumanResourceStaff } from './entities/human_resource_staff.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('human-resource-staff')
export class HumanResourceStaffController {
  constructor(
    private readonly humanResourceStaffService: HumanResourceStaffService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() HumanResourceStaffEntity: HumanResourceStaff) {
    return this.humanResourceStaffService.create(HumanResourceStaffEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.humanResourceStaffService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.humanResourceStaffService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Get('/role/:id')
  findByRole(@Param('id') id: number) {
    return this.humanResourceStaffService.findByRole(id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/:search')
  findByStaffIdNameRole(@Param('search') search: string) {
    return this.humanResourceStaffService.findByStaffIdNameRole(search);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() HumanResourceStaffENTITY: HumanResourceStaff,
  ) {
    return this.humanResourceStaffService.update(id, HumanResourceStaffENTITY);
  }

  @UseGuards(AuthGuard)
  @Patch('/password/:id')
  updateStaffPassword(
    @Param('id') id: number,
    @Body() HumanResourceStaffENTITY: HumanResourceStaff,
  ) {
    return this.humanResourceStaffService.updateStaffPassword(
      id,
      HumanResourceStaffENTITY,
    );
  }

  @UseGuards(AuthGuard)
  @Post('disable/:id')
  async disableStaff(@Param('id') id: number) {
    return this.humanResourceStaffService.disableStaff(id);
  }
  @UseGuards(AuthGuard)
  @Post('enable/:id')
  async enableStaff(@Param('id') id: number) {
    return this.humanResourceStaffService.enableStaff(id);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeStaff(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.humanResourceStaffService.remove(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }

  @UseGuards(AuthGuard)
  @Get('/disabled/staff')
  findAllDisableStaff() {
    return this.humanResourceStaffService.findAllDisableStaff();
  }

  @UseGuards(AuthGuard)
  @Get('/disabled/role/:id')
  findByDisabledStaffRole(@Param('id') id: number) {
    return this.humanResourceStaffService.findByDisabledStaffRole(id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/disabledStaff/:search')
  findByDisabledStaffIdNameRole(@Param('search') search: string) {
    return this.humanResourceStaffService.findByDisabledStaffIdNameRole(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_all_staff_list')
  async findAllStaff(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out = await this.humanResourceStaffService.findAllStaff(
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Get('/v2/get_staff_search_list')
  async findAllStaffsearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('role_id') role_id?: number,
  ) {
    try {
      let final_out = await this.humanResourceStaffService.findAllStaffsearch(
        search,
        limit || 10,
        page || 1,
        role_id,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Get('/v2/get_all_disabled_staff_list')
  async findAllDisabledStaff(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out = await this.humanResourceStaffService.findAllDisabledStaff(
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Get('/v2/get_disabled_staff_search_list')
  async findAllDisabledStaffsearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out =
        await this.humanResourceStaffService.findAllDisabledStaffsearch(
          search,
          limit || 10,
          page || 1,
        );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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
  @Get('/v2/get_staff_list_by_role')
  async findStaffListByRole(
    @Query('search') search: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('role_id') role_id?: number,
  ) {
    try {
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const roleId = Number(role_id);

      const final_output =
        await this.humanResourceStaffService.findStaffListByRole(
          search,
          limitNum,
          pageNum,
          roleId,
        );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
        };
      }

      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: 'No staff found for the provided role.',
        data: [],
        total: 0,
      };
    } catch (error) {
      console.error('Error in get_staff_list_by_role:', error);
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_disabled_staff_list_by_role')
  async findDisabledStaffListByRole(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('role_id') role_id?: number,
  ) {
    try {
      const final_output =
        await this.humanResourceStaffService.findDisabledStaffListByRole(
          search,
          limit || 10,
          page || 1,
          role_id,
        );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
        };
      }

      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.DATA_NOT_FOUND,
        data: [],
        total: 0,
      };
    } catch (error) {
      console.error('Error in get_disabled_staff_list_by_role:', error);
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v3/get_staff_search_list')
  async findAllstaffsearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('role_id') role_id?: number,
  ) {
    try {
      let final_out = await this.humanResourceStaffService.findAllstaffsearch(
        search,
        limit || 10,
        page || 1,
        role_id,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
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

  @Get('/v3/get_staff_search_list_new')
  async V3findAllstaffsearch(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('role_id') role_id?: number,
  ) {
    try {
      let final_out = await this.humanResourceStaffService.V3findAllstaffsearch(
        search,
        limit || 10,
        page || 1,
        role_id,
      );

      // if (final_out.details.length > 0) {
      //   return {
      //     status_code: process.env.SUCCESS_STATUS_CODE,
      //     status: process.env.SUCCESS_STATUS,
      //     message: process.env.SUCCESS_MESSAGE,
      //     data: final_out.details,
      //     total: final_out.total,
      //   };
      // }
      // else {
      //   return {
      //     status_code: process.env.SUCCESS_STATUS_CODE,
      //     status: process.env.SUCCESS_STATUS,
      //     message: process.env.DATA_NOT_FOUND
      //   }
      // }
      return final_out;
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }
}
