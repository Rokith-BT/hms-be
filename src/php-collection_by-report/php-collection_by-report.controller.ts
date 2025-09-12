import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PhpCollectionByReportService } from './php-collection_by-report.service';
import { CreatePhpCollectionByReportDto } from './dto/create-php-collection_by-report.dto';
import { UpdatePhpCollectionByReportDto } from './dto/update-php-collection_by-report.dto';

@Controller('php-collection-by-report')
export class PhpCollectionByReportController {
  constructor(private readonly phpCollectionByReportService: PhpCollectionByReportService) {}

  @Post()
 async create(@Body() createPhpCollectionByReportDto: CreatePhpCollectionByReportDto,@Query('limit') limit: number, @Query('page') page: number,@Query('search')search: string) {
        if(!createPhpCollectionByReportDto.startDate || !createPhpCollectionByReportDto.endDate){
      return{
        status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE_PARAM_MISSING
      }
    }

    try {
      let final_out = await this.phpCollectionByReportService.create(createPhpCollectionByReportDto, limit || 10, page || 1,search);

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
  findAll(@Query('name') name: string) {
    return this.phpCollectionByReportService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phpCollectionByReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpCollectionByReportDto: UpdatePhpCollectionByReportDto) {
    return this.phpCollectionByReportService.update(+id, updatePhpCollectionByReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpCollectionByReportService.remove(+id);
  }
}
