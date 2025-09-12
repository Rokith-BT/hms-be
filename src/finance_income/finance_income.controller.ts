import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceIncomeService } from './finance_income.service';
import { FinanceIncome } from './entities/finance_income.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('finance-income')
export class FinanceIncomeController {
  constructor(private readonly financeIncomeService: FinanceIncomeService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() Entity: FinanceIncome) {
    return this.financeIncomeService.create(Entity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.financeIncomeService.findall();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeIncomeService.findone(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() Entity: FinanceIncome) {
    return this.financeIncomeService.update(+id, Entity);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Body() Entity: FinanceIncome) {
    return this.financeIncomeService.remove(+id, Entity);
  }



  @UseGuards(AuthGuard)
  @Get('/v2/getfinanceincome')
  async findallincome(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {
      let final_output = await this.financeIncomeService.finance_income(
        limit || 10,
        page || 1,
        search || ''

      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
        }
      }

    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }

}
