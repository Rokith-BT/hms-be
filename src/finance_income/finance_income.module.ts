import { Module } from '@nestjs/common';
import { FinanceIncomeService } from './finance_income.service';
import { FinanceIncomeController } from './finance_income.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceIncome } from './entities/finance_income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceIncome])],

  controllers: [FinanceIncomeController],
  providers: [FinanceIncomeService, DynamicDatabaseService],
})
export class FinanceIncomeModule {}
