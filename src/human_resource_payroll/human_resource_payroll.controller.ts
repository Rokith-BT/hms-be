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
import { HumanResourcePayrollService } from './human_resource_payroll.service';
import { HumanResourcePayroll } from './entities/human_resource_payroll.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('human-resource-payroll')
export class HumanResourcePayrollController {
  constructor(
    private readonly humanResourcePayrollService: HumanResourcePayrollService,
  ) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() createHumanResourcePayroll: HumanResourcePayroll) {
    return this.humanResourcePayrollService.create(createHumanResourcePayroll);
  }
@UseGuards(AuthGuard)
  @Get()
  async getStaffPayrollList(@Query() filters: any) {
    try {
      const getStaffPayroll =
        await this.humanResourcePayrollService.getStaffPayrollList(filters);
      return getStaffPayroll;
    } catch (error) {
      console.error(error);
    }
  }
@UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() createHumanResourcePayroll: HumanResourcePayroll,
  ) {
    return this.humanResourcePayrollService.update(
      +id,
      createHumanResourcePayroll,
    );
  }
@UseGuards(AuthGuard)
  @Delete('/:id')
  async revertPayslip(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.humanResourcePayrollService.revertPayslip(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
@UseGuards(AuthGuard)
  @Patch('/revertPaidPayslip/:id')
  updatePaidrevertStatus(
    @Param('id') id: string,
    @Query('hospital_id') hospital_id: number,
  ) {
    return this.humanResourcePayrollService.updatePaidrevertStatus(
      +id,
      hospital_id,
    );
  }
@UseGuards(AuthGuard)
  @Patch('/ProceedToPay/:id')
  proceedToPay(
    @Param('id') id: string,
    @Body() createHumanResourcePayroll: HumanResourcePayroll,
  ) {
    return this.humanResourcePayrollService.proceedToPay(
      +id,
      createHumanResourcePayroll,
    );
  }
@UseGuards(AuthGuard)
  @Get('/getCalculatedSalary/:id')
  findOne(@Param('id') id: string) {
    return this.humanResourcePayrollService.findOne(id);
  }
// @UseGuards(AuthGuard)
//   @Get('/v2/get_staff_payroll_list_by_role_month_year')
//   async StaffPayrollListByRoleMonthYear(
//     @Query('search') search: string,
//     @Query('limit') limit: number,
//     @Query('page') page: number,
//     @Query('year') year: number,
//     @Query('month') month: number,
//     @Query('role') role: number,
//   ) {
//     try {
//       const limitNum = Number(limit) || 10;
//       const pageNum = Number(page) || 1;
//       const roleId = role || null;

//       if (
//         !year ||
//         !month ||
//         isNaN(year) ||
//         isNaN(month) ||
//         month < 1 ||
//         month > 12
//       ) {
//         return {
//           status_code: process.env.ERROR_STATUS_CODE,
//           status: process.env.ERROR_STATUS,
//           message: 'Invalid or missing year/month provided.',
//         };
//       }

//       const attendanceDate = new Date(year, month - 1, 1);

//       const final_output =
//         await this.humanResourcePayrollService.StaffPayrollListByRoleMonthYear(
//           attendanceDate,
//           roleId,
//           search,
//           limitNum,
//           pageNum,
//         );

//       if (final_output.details.length > 0) {
//         return {
//           status_code: process.env.SUCCESS_STATUS_CODE,
//           status: process.env.SUCCESS_STATUS,
//           message: process.env.SUCCESS_MESSAGE,
//           data: final_output.details,
//           total: final_output.total,
//         };
//       }

//       return {
//         status_code: process.env.SUCCESS_STATUS_CODE,
//         status: process.env.SUCCESS_STATUS,
//         message: 'No staff found for the provided filters.',
//         data: [],
//         total: 0,
//       };
//     } catch (error) {
//       console.error('Error in get_staff_attendance_list_by_role_date:', error);
//       return {
//         status_code: process.env.ERROR_STATUS_CODE,
//         status: process.env.ERROR_STATUS,
//         message: process.env.ERROR_MESSAGE,
//       };
//     }
//   }



@UseGuards(AuthGuard)
@Get('/v2/get_staff_payroll_list_by_role_month_year')
async StaffPayrollListByRoleMonthYear(
  @Query('search') search: string,
  @Query('limit') limit: number,
  @Query('page') page: number,
  @Query('year') year: number,
  @Query('month') month: number,
  @Query('role') role: number,
) {
  try {
    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;
    const roleId = Number(role) || null;

    // ✅ Validate year/month input
    if (
      !year || !month ||
      isNaN(year) || isNaN(month) ||
      month < 1 || month > 12
    ) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: 'Invalid or missing year/month provided.',
      };
    }

    const attendanceDate = new Date(year, month - 1, 1);

    const final_output =
      await this.humanResourcePayrollService.StaffPayrollListByRoleMonthYear(
        attendanceDate,
        roleId,
        search,
        limitNum,
        pageNum,
      );

    return {
      status_code: process.env.SUCCESS_STATUS_CODE,
      status: process.env.SUCCESS_STATUS,
      message:
        final_output.details.length > 0
          ? process.env.SUCCESS_MESSAGE
          : 'No staff found for the provided filters.',
      data: final_output.details,
      total: final_output.total,
    };
  } catch (error) {
    console.error('Error in get_staff_payroll_list_by_role_month_year:', error);
    return {
      status_code: process.env.ERROR_STATUS_CODE,
      status: process.env.ERROR_STATUS,
      message: process.env.ERROR_MESSAGE,
    };
  }
}





  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  async removePayslipAllowance(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
 
    
    await this.humanResourcePayrollService.removePayslipAllowance(id, Hospital_id);
  
    
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }



  


}
