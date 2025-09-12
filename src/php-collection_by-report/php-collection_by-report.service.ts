import { Injectable } from '@nestjs/common';
import { CreatePhpCollectionByReportDto } from './dto/create-php-collection_by-report.dto';
import { UpdatePhpCollectionByReportDto } from './dto/update-php-collection_by-report.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpCollectionByReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,

  ) { }
  async create(createPhpCollectionByReportDto: CreatePhpCollectionByReportDto, limit: number, page: number, search: string) {
    try {
       const offset = limit * (page - 1);
    let query = `SELECT 
transactions.received_by_name collected_by,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount,
  SUM(IF(LOWER(transactions.payment_mode) = 'cash', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS cash,
  SUM(IF(LOWER(transactions.payment_mode) = 'card', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS card,
  SUM(IF(LOWER(transactions.payment_mode) = 'dd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS dd,
  SUM(IF(LOWER(transactions.payment_mode) = 'neft', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS neft,
  SUM(IF(LOWER(transactions.payment_mode) = 'upi', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS upi,
  SUM(IF(LOWER(transactions.payment_mode) = 'scheme', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS scheme,
  SUM(IF(LOWER(transactions.payment_mode) = 'online', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS online,
    SUM(IF(LOWER(transactions.payment_mode) = 'paylater', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS paylater,
    SUM(IF(LOWER(transactions.payment_mode) = 'offline', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS offline
FROM transactions
where date(transactions.payment_date) BETWEEN DATE('${createPhpCollectionByReportDto.startDate}') AND DATE('${createPhpCollectionByReportDto.endDate}')
 `
 let countQuery = `

  SELECT transactions.received_by_name
  FROM transactions
  WHERE DATE(transactions.payment_date) 
     BETWEEN DATE('${createPhpCollectionByReportDto.startDate}') 
  AND DATE('${createPhpCollectionByReportDto.endDate}') 


 `

if (search) {
  query += ` and transactions.received_by_name like '%${search}%' `
  countQuery += ` and transactions.received_by_name like '%${search}%' `
}
let finalOut = `  SELECT COUNT(*) AS count
FROM (
  ${countQuery} 
  GROUP BY transactions.received_by_name
) AS count`
    let grpby = ` group by transactions.received_by_name limit ${limit} offset ${offset}`
    
    const getOutput = await this.dynamicConnection.query(query + grpby);
    const getCount = await this.dynamicConnection.query(finalOut);
    
    let out :any ={
      details: getOutput,
      count: getCount[0]?.count ?? 0
    }
    return out;
    } catch (error) {
      console.log(error,"error");
      
      return error
    }
   
  }

  findAll(name:string) {
    const getStaffDetails = `SELECT 
    staff.name AS firstname,
    staff.surname AS lastname,
    staff.employee_id AS employeeId,
    staff.contact_no AS mobile,
    department.department_name AS department,
    staff_designation.designation AS designation
FROM 
    staff 
LEFT JOIN 
    staff_designation ON staff.staff_designation_id = staff_designation.id
LEFT JOIN 
    department ON staff.department_id = department.id
WHERE 
    CONCAT(staff.name, ' ', staff.surname) LIKE ?
    OR CONCAT(staff.name, staff.surname) LIKE ?
`
    const getOut = this.dynamicConnection.query(getStaffDetails,[`%${name}%`, `%${name}%`]);
    return getOut;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpCollectionByReport`;
  }

  update(id: number, updatePhpCollectionByReportDto: UpdatePhpCollectionByReportDto) {
    return `This action updates a #${id} phpCollectionByReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpCollectionByReport`;
  }
}
