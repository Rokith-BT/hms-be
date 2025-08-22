import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpOpdReportService } from './php-opd-report.service';
import { CreatePhpOpdReportDto } from './dto/create-php-opd-report.dto';
import { UpdatePhpOpdReportDto } from './dto/update-php-opd-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-opd-report')
export class PhpOpdReportController {
  constructor(private readonly phpOpdReportService: PhpOpdReportService) {}

  @UseGuards(AuthGuard)  
  @Post()
 async create(@Body() createPhpAppointmentReportDto: CreatePhpOpdReportDto,@Query('limit') limit: number,@Query('page') page: number,@Query('search')search: string) {
    if(!createPhpAppointmentReportDto.fromDate || !createPhpAppointmentReportDto.toDate){
      return{
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpOpdReportService.create(createPhpAppointmentReportDto,Number(limit) || 10, page || 1,search);

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
    return this.phpOpdReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpOpdReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpOpdReportDto: UpdatePhpOpdReportDto) {
    return this.phpOpdReportService.update(+id, updatePhpOpdReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpOpdReportService.remove(+id);
  }
}
