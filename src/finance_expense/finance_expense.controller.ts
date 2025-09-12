import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FinanceExpenseService } from './finance_expense.service';
import { FinanceExpense } from './entities/finance_expense.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('finance-expense')
export class FinanceExpenseController {
  constructor(private readonly financeExpenseService: FinanceExpenseService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() Entity: FinanceExpense) {
    return this.financeExpenseService.create(Entity);
  }


  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.financeExpenseService.findall();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeExpenseService.findone(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() Entity: FinanceExpense) {
    return this.financeExpenseService.update(+id, Entity);
  }


  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Body() Entity: FinanceExpense) {
    return this.financeExpenseService.remove(+id, Entity);
  }


  @UseGuards(AuthGuard)
  @Get('/v2/getfinanceexpense')
  async findallexpense(@Query('limit') limit: number, @Query('page') page: number, @Query('search') search?: string) {
    try {
      let final_output = await this.financeExpenseService.finance_expense(
        limit || 10,
        page || 1,
        search || ''
      );


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
