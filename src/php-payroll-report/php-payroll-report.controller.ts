import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpPayrollReportService } from './php-payroll-report.service';
import { CreatePhpPayrollReportDto } from './dto/create-php-payroll-report.dto';
import { UpdatePhpPayrollReportDto } from './dto/update-php-payroll-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-payroll-report')
export class PhpPayrollReportController {
  constructor(private readonly phpPayrollReportService: PhpPayrollReportService) { }
  
  @UseGuards(AuthGuard)  
  @Post()
  async create(@Body() createPhpAppointmentReportDto: CreatePhpPayrollReportDto, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {
    if (!createPhpAppointmentReportDto.year) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpPayrollReportService.create(createPhpAppointmentReportDto, Number(limit) || 10, page || 1, search);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
        };
      }
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DATA_NOT_FOUND_V2
        }
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_V2,
        "status": process.env.ERROR_STATUS_V2,
        "message": process.env.ERROR_MESSAGE_V2,
      }
    }
  }







  @Get()
  findAll() {
    return this.phpPayrollReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpPayrollReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpPayrollReportDto: UpdatePhpPayrollReportDto) {
    return this.phpPayrollReportService.update(+id, updatePhpPayrollReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpPayrollReportService.remove(+id);
  }
}
