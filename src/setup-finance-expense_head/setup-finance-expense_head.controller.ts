import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { SetupFinanceExpenseHeadService } from './setup-finance-expense_head.service';
import { SetupFinanceExpenseHead } from './entities/setup-finance-expense_head.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-finance-expense-head')
export class SetupFinanceExpenseHeadController {
  constructor(
    private readonly setupFinanceExpenseHeadService: SetupFinanceExpenseHeadService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() expense_headEntity: SetupFinanceExpenseHead) {
    return this.setupFinanceExpenseHeadService.create(expense_headEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFinanceExpenseHeadService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFinanceExpenseHeadService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() expense_headEntity: SetupFinanceExpenseHead,
  ) {
    return this.setupFinanceExpenseHeadService.update(id, expense_headEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFinanceExpenseHeadService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupExpenseHead/:search')
  SetupExpensehead(@Param('search') search: string) {
    return this.setupFinanceExpenseHeadService.SetupExpensehead(search);
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllexpense_head')
  async findallexpense_head(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupFinanceExpenseHeadService.findALLexpense_head(
        limit || 10,
        page || 1
      )


      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit)
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
