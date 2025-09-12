import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpDailyTransactionSummaryReportService } from './php-daily-transaction-summary-report.service';
import { CreatePhpDailyTransactionSummaryReportDto } from './dto/create-php-daily-transaction-summary-report.dto';
import { UpdatePhpDailyTransactionSummaryReportDto } from './dto/update-php-daily-transaction-summary-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-daily-transaction-summary-report')
export class PhpDailyTransactionSummaryReportController {
  constructor(private readonly phpDailyTransactionSummaryReportService: PhpDailyTransactionSummaryReportService) {}
@UseGuards(AuthGuard)
  @Post()
 async create(@Body() createPhpDailyTransactionSummaryReportDto: CreatePhpDailyTransactionSummaryReportDto) {
    if(!createPhpDailyTransactionSummaryReportDto.fromDate || !createPhpDailyTransactionSummaryReportDto.toDate){
      return{
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpDailyTransactionSummaryReportService.create(createPhpDailyTransactionSummaryReportDto);
console.log(final_out,"final_out");

      if (final_out) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out,
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
@UseGuards(AuthGuard)
  @Get()
 async findAll(@Query('section') section: string, @Query('date') date: string) {
    if(!section || !date){
      return{
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpDailyTransactionSummaryReportService.findAll(section, date);
console.log(final_out,"final_out");

      if (final_out.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out,
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
@UseGuards(AuthGuard)
  @Get(':id')
 async findOne(@Param('id') id: string, @Query('hospital_id') hospital_id: string) {
       if(!id || !hospital_id){
      return{
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpDailyTransactionSummaryReportService.findOne(id,hospital_id);

      if (final_out.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out,
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
    return this.phpDailyTransactionSummaryReportService.findOne(id,hospital_id);
  }
@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpDailyTransactionSummaryReportDto: UpdatePhpDailyTransactionSummaryReportDto) {
    return this.phpDailyTransactionSummaryReportService.update(+id, updatePhpDailyTransactionSummaryReportDto);
  }
@UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpDailyTransactionSummaryReportService.remove(+id);
  }
}
