import { Module } from '@nestjs/common';
import { FinanceExpenseService } from './finance_expense.service';
import { FinanceExpenseController } from './finance_expense.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceExpense } from './entities/finance_expense.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([FinanceExpense])],

  controllers: [FinanceExpenseController],
  providers: [FinanceExpenseService,DynamicDatabaseService],
})
export class FinanceExpenseModule {}
