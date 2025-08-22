import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardStaffService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async staff_dashboard() {
    try {
      const roles = await this.connection.query(`
      select roles.name,COALESCE(COUNT(staff_roles.role_id), 0) AS count from roles
left join staff_roles ON staff_roles.role_id = roles.id AND staff_roles.is_active = 1
GROUP BY roles.name order by roles.name`);
      return roles;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async monthly_income() {
    try {
      const [appointment_count] = await this.connection.query(
        `SELECT COUNT(appointment.id) AS Appointment
FROM appointment
WHERE appointment.module = 'appointment'
  AND MONTH(appointment.date) = MONTH(CURDATE())
  AND YEAR(appointment.date) = YEAR(CURDATE());
`,
      );

      const [opd_count] = await this.connection.query(
        `SELECT COUNT(appointment.id) AS opd
FROM appointment
WHERE appointment.module = 'OPD'
  AND MONTH(appointment.date) = MONTH(CURDATE())
  AND YEAR(appointment.date) = YEAR(CURDATE());
`,
      );

      const [ipd_count] = await this.connection.query(
        `select count(ipd_details.id) as ipd from ipd_details
        WHERE MONTH(ipd_details.date) = MONTH(CURDATE())
  AND YEAR(ipd_details.date) = YEAR(CURDATE());`,
      );

      const [income_count] = await this.connection.query(
        `select count(income.id) as income from income
        WHERE MONTH(income.date) = MONTH(CURDATE())
        AND YEAR(income.date) = YEAR(CURDATE());`,
      );

      return {
        appointment_count: appointment_count.Appointment,
        opd_count: opd_count.opd,
        ipd_count: ipd_count.ipd,
        income_count: income_count.income,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async yearly_income() {
    try {
      const yearly_income = await this.connection.query(`
       SELECT m.month,COALESCE(SUM(i.amount), 0) AS monthly_income FROM 
  (
    SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 
    UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) AS m
LEFT JOIN income i ON MONTH(i.date) = m.month AND YEAR(i.date) = YEAR(CURDATE())
GROUP BY m.month
ORDER BY m.month;
      `);

      return yearly_income;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async yearly_expense() {
    try {
      const yearly_expense = await this.connection.query(`
        
SELECT m.month,COALESCE(SUM(e.amount), 0) AS monthly_expenses
FROM 
  (
    SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 
    UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) AS m
LEFT JOIN expenses e ON MONTH(e.date) = m.month AND YEAR(e.date) = YEAR(CURDATE())
GROUP BY m.month
ORDER BY m.month;
        `);
      return yearly_expense;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
