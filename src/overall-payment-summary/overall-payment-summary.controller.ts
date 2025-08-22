import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OverallPaymentSummaryService } from './overall-payment-summary.service';
import { CreateOverallPaymentSummaryDto } from './dto/create-overall-payment-summary.dto';
import { UpdateOverallPaymentSummaryDto } from './dto/update-overall-payment-summary.dto';

@Controller('overall-payment-summary')
export class OverallPaymentSummaryController {
  constructor(private readonly overallPaymentSummaryService: OverallPaymentSummaryService) {}

  @Post()
  create(@Body() createOverallPaymentSummaryDto: CreateOverallPaymentSummaryDto) {
    return this.overallPaymentSummaryService.create(createOverallPaymentSummaryDto);
  }

  @Get()
  findAll() {
    return this.overallPaymentSummaryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.overallPaymentSummaryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOverallPaymentSummaryDto: UpdateOverallPaymentSummaryDto) {
    return this.overallPaymentSummaryService.update(+id, updateOverallPaymentSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.overallPaymentSummaryService.remove(+id);
  }
}
