import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardIncomeExpenseService } from './dashboard_income_expense.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('dashboard-income-expense')
export class DashboardIncomeExpenseController {
  constructor(private readonly dashboardIncomeExpenseService: DashboardIncomeExpenseService) {}

  @UseGuards(AuthGuard)
  @Get('appointment')
  getDailyAppointmentIncome() {
    return this.dashboardIncomeExpenseService.getDailyAppointmentIncome();
  }

  @UseGuards(AuthGuard)
  @Get('opd')
  getDailyOpdIncome() {
    return this.dashboardIncomeExpenseService.getDailyOpdIncome();
  }

  @UseGuards(AuthGuard)
  @Get('ipd')
  getDailyIpdIncome() {
    return this.dashboardIncomeExpenseService.getDailyIpdIncome();
  }

  @UseGuards(AuthGuard)
  @Get('total-income')
  getTotalIncome() {
    return this.dashboardIncomeExpenseService.getTotalIncome();
  }

  @UseGuards(AuthGuard)
  @Get('total-expenses')
  getTotalExpenses() {
    return this.dashboardIncomeExpenseService.getTotalExpenses();
  }
}
