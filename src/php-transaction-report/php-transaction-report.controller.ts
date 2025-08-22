import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PhpTransactionReportService } from './php-transaction-report.service';
import { CreatePhpTransactionReportDto } from './dto/create-php-transaction-report.dto';
import { UpdatePhpTransactionReportDto } from './dto/update-php-transaction-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('php-transaction-report')
export class PhpTransactionReportController {
  constructor(private readonly phpTransactionReportService: PhpTransactionReportService) {}


// @UseGuards(AuthGuard)
//   @Post()
//  async create(@Body() createPhpTransactionReportDto: CreatePhpTransactionReportDto, @Query('limit') limit: number, @Query('page') page: number, @Query('search') search: string,@Query('filter') filter?: string) { 

//     if (!createPhpTransactionReportDto.startDate || !createPhpTransactionReportDto.endDate) {
//       return {
//         status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
//         status: process.env.ERROR_STATUS,
//         message: process.env.ERROR_MESSAGE_PARAM_MISSING
//       }
//     }

//     try {
//       let final_out = await this.phpTransactionReportService.create(createPhpTransactionReportDto, Number(limit) || 10, page || 1, search, filter);

//       if (final_out?.details.length > 0) {
//         return {
//           status_code: process.env.SUCCESS_STATUS_CODE_V2,
//           status: process.env.SUCCESS_STATUS_V2,
//           message: process.env.SUCCESS_MESSAGE_V2,
//           data: final_out.details,
//           total: final_out.total,
//         };
//       }
//       else {
//         return {
//           status_code: process.env.SUCCESS_STATUS_CODE_V2,
//           status: process.env.SUCCESS_STATUS_V2,
//           message: process.env.DATA_NOT_FOUND_V2
//         }
//       }
//     } catch (error) {
//       return {
//         status_code: process.env.ERROR_STATUS_CODE_V2,
//         "status": process.env.ERROR_STATUS_V2,
//         "message": process.env.ERROR_MESSAGE_V2,
//       }
//     }
//   }


@UseGuards(AuthGuard)
@Post()
async create(
  @Body() createPhpTransactionReportDto: CreatePhpTransactionReportDto,
  @Query('limit') limit: number,
  @Query('page') page: number,
  @Query('search') search: string,
  @Query('filter') filter?: string
) {
  if (!createPhpTransactionReportDto.startDate || !createPhpTransactionReportDto.endDate) {
    return {
      status_code: process.env.ERROR_STATUS_CODE_PARAM_MISSING,
      status: process.env.ERROR_STATUS,
      message: process.env.ERROR_MESSAGE_PARAM_MISSING,
    };
  }

  try {
    const final_out = await this.phpTransactionReportService.create(
      createPhpTransactionReportDto,
      Number(limit) || 10,
      Number(page) || 1,
      search,
      filter
    );

    if (final_out?.details.length > 0) {
      return {
        status_code: process.env.SUCCESS_STATUS_CODE_V2,
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.SUCCESS_MESSAGE_V2,
        data: final_out.details,
        total: final_out.total,
      };
    } else {
      return {
        status_code: process.env.SUCCESS_STATUS_CODE_V2,
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DATA_NOT_FOUND_V2,
      };
    }
  } catch (error) {
    console.error("Controller Error:", error);
    return {
      status_code: process.env.ERROR_STATUS_CODE_V2,
      status: process.env.ERROR_STATUS_V2,
      message: process.env.ERROR_MESSAGE_V2,
    };
  }
}


  @Get()
  findAll() {
    return this.phpTransactionReportService.findAll();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhpTransactionReportDto: UpdatePhpTransactionReportDto) {
    return this.phpTransactionReportService.update(+id, updatePhpTransactionReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phpTransactionReportService.remove(+id);
  }


@Get('/collected_by')
 findAllCollectedBy() {
  console.log("c");
  
  return this.phpTransactionReportService.findcollected_by();
}

}
