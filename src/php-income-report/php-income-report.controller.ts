import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpIncomeReportService } from './php-income-report.service';
import { CreatePhpIncomeReportDto } from './dto/create-php-income-report.dto';
import { UpdatePhpIncomeReportDto } from './dto/update-php-income-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-income-report')
export class PhpIncomeReportController {
  constructor(private readonly phpIncomeReportService: PhpIncomeReportService) { }
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createPhpIncomeReportDto: CreatePhpIncomeReportDto, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpIncomeReportService.create(createPhpIncomeReportDto, limit || 10, page || 1, search);
      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
          header: final_out.header
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
  @Post('/total')
  async findAll(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpIncomeReportService.findAll(limit || 10, page || 1, search);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
          header: final_out.header
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
  @Post('/month-wise')
  async findAllMonth(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpIncomeReportService.findAllPerMonth(limit || 10, page || 1);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
          header: final_out.header

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
  @Post('/doctor-wise')
  async findAllDoctor(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpIncomeReportService.findAllPerDoctor(limit || 10, page || 1, search);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
          header: final_out.header

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
  @Post('/patient-wise')
  async findAllPat(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpIncomeReportService.findAllPerPatient(limit || 10, page || 1, search);

      if (final_out?.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE_V2,
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.SUCCESS_MESSAGE_V2,
          data: final_out.details,
          total: final_out.count,
          header: final_out.header

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
  findOne(@Param('id') id: string) {
    return this.phpIncomeReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpIncomeReportDto: UpdatePhpIncomeReportDto) {
    return this.phpIncomeReportService.update(+id, updatePhpIncomeReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpIncomeReportService.remove(+id);
  }
}
