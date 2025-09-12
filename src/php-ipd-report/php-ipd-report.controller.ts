import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpIpdReportService } from './php-ipd-report.service';
import { CreatePhpIpdReportDto } from './dto/create-php-ipd-report.dto';
import { UpdatePhpIpdReportDto } from './dto/update-php-ipd-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-ipd-report')
export class PhpIpdReportController {
  constructor(private readonly phpIpdReportService: PhpIpdReportService) { }
 
  @UseGuards(AuthGuard)  
  @Post()
  async create(@Body() createPhpAppointmentReportDto: CreatePhpIpdReportDto, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {
    if (!createPhpAppointmentReportDto.fromDate || !createPhpAppointmentReportDto.toDate) {
      return {
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpIpdReportService.create(createPhpAppointmentReportDto, Number(limit) || 10, page || 1, search);

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
    return this.phpIpdReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpIpdReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpIpdReportDto: UpdatePhpIpdReportDto) {
    return this.phpIpdReportService.update(+id, updatePhpIpdReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpIpdReportService.remove(+id);
  }
}
