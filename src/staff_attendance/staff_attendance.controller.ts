import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { StaffAttendanceService } from './staff_attendance.service';
import { StaffAttendance } from './entities/staff_attendance.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(
    private readonly staffAttendanceService: StaffAttendanceService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createStaffAttendanceArray: StaffAttendance[]) {
    return this.staffAttendanceService.create(createStaffAttendanceArray);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async updateStaffAttendance(
    @Body() createStaffAttendanceArray: StaffAttendance[],
  ) {
    const formattedStaffAttendanceArray = createStaffAttendanceArray.map(
      (item) => ({
        ...item,
        date:
          item.date instanceof Date
            ? item.date.toISOString().split('T')[0]
            : item.date,
      }),
    );

    const result = await this.staffAttendanceService.updateStaffAttendance(
      formattedStaffAttendanceArray,
    );

    return {
      status: 'success',
      message: 'Staff attendance updated successfully',
      data: result,
    };
  }

  @UseGuards(AuthGuard)
  @Get()
  async getStaffAttendanceList(@Query() filters: any) {
    try {
      const getStaffAttendance =
        await this.staffAttendanceService.getStaffAttendanceList(filters);
      return getStaffAttendance;
    } catch (error) {
      console.error(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v2/get_staff_attendance_list_by_role_date')
async StaffAttendanceListByRoleDate(
  @Query('search') search: string,
  @Query('limit') limit: number,
  @Query('page') page: number,
  @Query('date') date: string,
  @Query('role') role: number,
) {
  try {
    const attendanceDate = date ? new Date(date) : null;
    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;
    const roleId = role || null;

    if (!attendanceDate || isNaN(attendanceDate.getTime())) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: "Invalid or missing date provided.",
      };
    }

    const final_output = await this.staffAttendanceService.StaffAttendanceListByRoleDate(
      attendanceDate,
      roleId,
      search,
      limitNum,
      pageNum
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
      message: "No staff found for the provided filters.",
      data: [],
      total: 0,
    };
  } catch (error) {
    console.error('Error in get_staff_attendance_list_by_role_date:', error);
    return {
      status_code: process.env.ERROR_STATUS_CODE,
      status: process.env.ERROR_STATUS,
      message: process.env.ERROR_MESSAGE,
    };
  }
}



}
