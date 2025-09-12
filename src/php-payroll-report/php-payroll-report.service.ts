import { Injectable } from '@nestjs/common';
import { CreatePhpPayrollReportDto, PhpPayrollReportResponseDto } from './dto/create-php-payroll-report.dto';
import { UpdatePhpPayrollReportDto } from './dto/update-php-payroll-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpPayrollReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createPhpAppointmentReportDto: CreatePhpPayrollReportDto, limit: number, page: number, search: string)
    : Promise<PhpPayrollReportResponseDto> {
    const offset = limit * (page - 1);

    let query = `
      SELECT 
    staff.id AS staff_id,
    staff.employee_id,
    staff.name,
    roles.name AS user_type,
    staff.surname,
    staff_designation.designation,
    department.department_name AS department,
    staff_payslip.*
FROM 
    staff
INNER JOIN 
    staff_payslip ON staff_payslip.staff_id = staff.id
LEFT JOIN 
    staff_designation ON staff.staff_designation_id = staff_designation.id
LEFT JOIN 
    department ON staff.department_id = department.id
LEFT JOIN 
    staff_roles ON staff_roles.staff_id = staff.id
LEFT JOIN 
    roles ON staff_roles.role_id = roles.id
WHERE 
    staff_payslip.status = 'paid'
    

    `;

    let countQuery = `
      SELECT COUNT(staff.id) AS total 
      FROM 
    staff
INNER JOIN 
    staff_payslip ON staff_payslip.staff_id = staff.id
LEFT JOIN 
    staff_designation ON staff.staff_designation_id = staff_designation.id
LEFT JOIN 
    department ON staff.department_id = department.id
LEFT JOIN 
    staff_roles ON staff_roles.staff_id = staff.id
LEFT JOIN 
    roles ON staff_roles.role_id = roles.id
WHERE 
    staff_payslip.status = 'paid'

    `;

    const queryParams: any[] = [];

    if (createPhpAppointmentReportDto.month) {
      query += ` AND LOWER(staff_payslip.month) = lower(?) `;
      countQuery += ` AND LOWER(staff_payslip.month) = lower(?) `;
      queryParams.push(createPhpAppointmentReportDto.month);
    }

    if (createPhpAppointmentReportDto.year) {
      query += ` AND staff_payslip.year = ? `;
      countQuery += ` AND staff_payslip.year = ?`;
      queryParams.push(createPhpAppointmentReportDto.year);
    }

    if (createPhpAppointmentReportDto.roleId) {
      query += `  AND roles.id = ? `;
      countQuery += `  AND roles.id = ? `;
      queryParams.push(createPhpAppointmentReportDto.roleId);
    }



    if (search) {
      const likeSearch = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];

      query += ` AND (roles.name LIKE ? OR staff_designation.designation LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
      countQuery += ` AND (roles.name LIKE ? OR staff_designation.designation LIKE ? OR staff.name LIKE ? OR staff.surname LIKE ?)`;
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
    return `This action returns all phpPayrollReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpPayrollReport`;
  }

  update(id: number, updatePhpPayrollReportDto: UpdatePhpPayrollReportDto) {
    return `This action updates a #${id} phpPayrollReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpPayrollReport`;
  }
}
