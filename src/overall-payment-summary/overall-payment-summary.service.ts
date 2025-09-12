import { Injectable } from '@nestjs/common';
import { CreateOverallPaymentSummaryDto } from './dto/create-overall-payment-summary.dto';
import { UpdateOverallPaymentSummaryDto } from './dto/update-overall-payment-summary.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OverallPaymentSummaryService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
  ) {}
  async create(createOverallPaymentSummaryDto: CreateOverallPaymentSummaryDto) {
    const update_user_payment_summary = await this.connection.query(``);
    return 'This action adds a new overallPaymentSummary';
  }

  findAll() {
    return `This action returns all overallPaymentSummary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} overallPaymentSummary`;
  }

  update(
    id: number,
    updateOverallPaymentSummaryDto: UpdateOverallPaymentSummaryDto,
  ) {
    return `This action updates a #${id} overallPaymentSummary`;
  }

  remove(id: number) {
    return `This action removes a #${id} overallPaymentSummary`;
  }
}
