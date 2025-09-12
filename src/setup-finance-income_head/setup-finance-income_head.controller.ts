import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetupFinanceIncomeHeadService } from './setup-finance-income_head.service';
import { SetupFinanceIncomeHead } from './entities/setup-finance-income_head.entity';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('setup-finance-income-head')
export class SetupFinanceIncomeHeadController {
  constructor(
    private readonly setupFinanceIncomeHeadService: SetupFinanceIncomeHeadService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() income_headEntity: SetupFinanceIncomeHead) {
    return this.setupFinanceIncomeHeadService.create(income_headEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupFinanceIncomeHeadService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupFinanceIncomeHeadService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() income_headEntity: SetupFinanceIncomeHead,
  ) {
    return this.setupFinanceIncomeHeadService.update(id, income_headEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupFinanceIncomeHeadService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/SetupIncomeHead/:search')
  SetupIncomehead(@Param('search') search: string) {
    return this.setupFinanceIncomeHeadService.SetupIncomehead(search);
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAllincome_head')
  async findallincome_head(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupFinanceIncomeHeadService.findALLincome_head(
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

