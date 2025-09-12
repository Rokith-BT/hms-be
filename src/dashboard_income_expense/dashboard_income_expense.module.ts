import { Module } from '@nestjs/common';
import { DashboardIncomeExpenseService } from './dashboard_income_expense.service';
import { DashboardIncomeExpenseController } from './dashboard_income_expense.controller';

@Module({
  controllers: [DashboardIncomeExpenseController],
  providers: [DashboardIncomeExpenseService],
})
export class DashboardIncomeExpenseModule {}
