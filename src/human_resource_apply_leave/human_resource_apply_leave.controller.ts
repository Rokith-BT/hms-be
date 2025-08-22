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
import { HumanResourceApplyLeaveService } from './human_resource_apply_leave.service';
import { HumanResourceApplyLeave } from './entities/human_resource_apply_leave.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('human-resource-apply-leave')
export class HumanResourceApplyLeaveController {
  constructor(
    private readonly humanResourceApplyLeaveService: HumanResourceApplyLeaveService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createHumanResourceApplyLeave: HumanResourceApplyLeave) {
    return this.humanResourceApplyLeaveService.create(
      createHumanResourceApplyLeave,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.humanResourceApplyLeaveService.findAll();
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeStaffLeave(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.humanResourceApplyLeaveService.remove(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Post('/addLeaveRequest')
  createLeaveRequest(
    @Body() createHumanResourceApplyLeaveRequest: HumanResourceApplyLeave,
  ) {
    return this.humanResourceApplyLeaveService.createLeaveRequest(
      createHumanResourceApplyLeaveRequest,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/addLeaveRequest')
  findAllLeaveRequest() {
    return this.humanResourceApplyLeaveService.findAllLeaveRequest();
  }
  @UseGuards(AuthGuard)
  @Patch('/addLeaveRequest/:id')
  updateStaffLeaveRequest(
    @Param('id') id: number,
    @Body() updateHumanResourceApplyLeave: HumanResourceApplyLeave,
  ) {
    return this.humanResourceApplyLeaveService.updateStaffLeaveRequest(
      id,
      updateHumanResourceApplyLeave,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/:search')
  findByOwnStaffLeaveDetails(@Param('search') search: string) {
    return this.humanResourceApplyLeaveService.findByOwnStaffLeaveDetails(
      search,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/AdminStaffkeyword/:search')
  findByAdminStaffLeaveDetails(@Param('search') search: string) {
    return this.humanResourceApplyLeaveService.findByAdminStaffLeaveDetails(
      search,
    );
  }
  @UseGuards(AuthGuard)
  @Get('/listRoles')
  findRoles() {
    return this.humanResourceApplyLeaveService.findRoles();
  }
  @UseGuards(AuthGuard)
  @Get('/listStaffByRole/:id')
  listStaffByRole(@Param('id') id: number) {
    return this.humanResourceApplyLeaveService.listStaffByRole(id);
  }
  @UseGuards(AuthGuard)
  @Get('/listStaffLeavesByStaffID/:id')
  listStallLeavesByStaffID(@Param('id') id: number) {
    return this.humanResourceApplyLeaveService.listStaffLeavesByStaffID(id);
  }


  @UseGuards(AuthGuard)
  @Get('/v2/get_staff_own_leave_request_details')
  async findStaffOwnLeaveRequestDetails(
    @Query('search') search?: string,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
    @Query('staffId') staffId?: number, 
  ) {
    try {
      const final_out = await this.humanResourceApplyLeaveService.findStaffOwnLeaveRequestDetails(
        search,
        limit,
        page,
        staffId,
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
  @Get('/v2/get_staff_leave_request_details')
  async findStaffLeaveRequestDetails(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    try {
      let final_out =
        await this.humanResourceApplyLeaveService.findStaffLeaveRequestDetails(
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
}
