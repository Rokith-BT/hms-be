import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpExpenseReportService } from './php-expense-report.service';
import { CreatePhpExpenseReportDto } from './dto/create-php-expense-report.dto';
import { UpdatePhpExpenseReportDto } from './dto/update-php-expense-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-expense-report')
export class PhpExpenseReportController {
  constructor(private readonly phpExpenseReportService: PhpExpenseReportService) { }
  
  
  @UseGuards(AuthGuard)  
  @Post()
  async create(@Body() createPhpExpenseReportDto: CreatePhpExpenseReportDto, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string) {

    try {
      let final_out = await this.phpExpenseReportService.create(createPhpExpenseReportDto, Number(limit) || 10, page || 1, search);

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
    return this.phpExpenseReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpExpenseReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpExpenseReportDto: UpdatePhpExpenseReportDto) {
    return this.phpExpenseReportService.update(+id, updatePhpExpenseReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpExpenseReportService.remove(+id);
  }
}
