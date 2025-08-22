import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardIncomeExpense } from './entities/dashboard_income_expense.entity';

@Injectable()
export class DashboardIncomeExpenseService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  private handleError(error: any) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE_V2,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private formatAmount(value: any): string {
    return parseFloat(value).toFixed(2);
  }

  async getDailyAppointmentIncome() {
    try {
      const result = await this.dynamicConnection.query(`
        SELECT COALESCE(SUM(amount), 0.00) AS dailyAppointmentIncome
FROM transactions
WHERE section = 'Appointment'
  AND payment_date >= CURDATE()
  AND payment_date < CURDATE() + INTERVAL 1 DAY
      `);
      return {
        dailyAppointmentIncome: this.formatAmount(result[0].dailyAppointmentIncome),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDailyOpdIncome() {
    try {
      const result = await this.dynamicConnection.query(`
        SELECT COALESCE(SUM(amount), 0.00) AS dailyOpdIncome
FROM transactions
WHERE section = 'OPD'
  AND payment_date >= CURDATE()
  AND payment_date < CURDATE() + INTERVAL 1 DAY
      `);
      return {
        dailyOpdIncome: this.formatAmount(result[0].dailyOpdIncome),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDailyIpdIncome() {
    try {
      const result = await this.dynamicConnection.query(`
        SELECT COALESCE(SUM(amount), 0.00) AS dailyIpdIncome
FROM transactions
WHERE section = 'IPD'
  AND payment_date >= CURDATE()
  AND payment_date < CURDATE() + INTERVAL 1 DAY
      `);
      return {
        dailyIpdIncome: this.formatAmount(result[0].dailyIpdIncome),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTotalIncome() {
    try {
      const result = await this.dynamicConnection.query(`
        SELECT COALESCE(SUM(amount), 0.00) AS "totalIncome"
        FROM income
      `);
      return {
        totalIncome: this.formatAmount(result[0].totalIncome),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTotalExpenses() {
    try {
      const result = await this.dynamicConnection.query(`
        SELECT COALESCE(SUM(amount), 0.00) AS "totalExpenses"
        FROM expenses
      `);
      return {
        totalExpenses: this.formatAmount(result[0].totalExpenses),
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
