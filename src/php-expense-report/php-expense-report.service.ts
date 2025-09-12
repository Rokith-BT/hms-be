import { Injectable } from '@nestjs/common';
import { CreatePhpExpenseReportDto } from './dto/create-php-expense-report.dto';
import { UpdatePhpExpenseReportDto } from './dto/update-php-expense-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpExpenseReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createPhpAppointmentReportDto: CreatePhpExpenseReportDto, limit: number, page: number, search: string)
  // : Promise<PhpPayrollReportResponseDto> 
  {
    const offset = limit * (page - 1);

    let query = `
      SELECT 
    expenses.*,
    expense_head.exp_category
FROM 
    expenses
LEFT JOIN 
    expense_head ON expense_head.id = expenses.exp_head_id
 WHERE 1=1


    `;

    let countQuery = `
       SELECT 
    COUNT(expenses.id) AS total
FROM 
    expenses
    WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (createPhpAppointmentReportDto.fromDate && createPhpAppointmentReportDto.toDate) {
      query += ` AND
      DATE(expenses.date) BETWEEN DATE(?) AND DATE(?) `;
      countQuery += ` AND
      DATE(expenses.date) BETWEEN DATE(?) AND DATE(?) `;
      queryParams.push(createPhpAppointmentReportDto.fromDate, createPhpAppointmentReportDto.toDate);
    }

    if (search) {
      const likeSearch = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

      query += ` AND (expenses.name LIKE ? OR expenses.invoice_no LIKE ? OR expenses.date LIKE ? OR expense_head.exp_category LIKE ?)`;
      countQuery += `  AND (expenses.name LIKE ? OR expenses.invoice_no LIKE ? OR expenses.date LIKE ? OR expense_head.exp_category LIKE ?) `;
      queryParams.push(...likeSearch);
    }

    query += `  LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);


    try {
      const data = await this.connection.query(query, queryParams);
      const [countData] = await this.connection.query(countQuery, queryParams);


      return {
        details: data,
        count: countData?.total ?? 0
      };
    } catch (error) {
      console.error("SQL Error:", error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all phpExpenseReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpExpenseReport`;
  }

  update(id: number, updatePhpExpenseReportDto: UpdatePhpExpenseReportDto) {
    return `This action updates a #${id} phpExpenseReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpExpenseReport`;
  }
}
