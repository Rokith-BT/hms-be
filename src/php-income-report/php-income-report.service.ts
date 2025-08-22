import { Injectable } from '@nestjs/common';
import { CreatePhpIncomeReportDto } from './dto/create-php-income-report.dto';
import { UpdatePhpIncomeReportDto } from './dto/update-php-income-report.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpIncomeReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,

  ) { }

  async create(createPhpIncomeReportDto: CreatePhpIncomeReportDto, limit: number, page: number, search: string) {
    const offset = limit * (page - 1);
    let query = ` select transactions.id bill_no,
  DATE(transactions.payment_date) bill_date,
  patients.patient_name,
  staff.name staff_first_name,
  staff.surname staff_last_name,
  transactions.amount,
  transactions.payment_mode,
  transactions.section from transactions
  left join patients on patients.id = transactions.patient_id
  left join visit_details on visit_details.opd_details_id = transactions.opd_id
  left join ipd_details on ipd_details.id = transactions.ipd_id
  left join staff on staff.id = (ipd_details.cons_doctor or visit_details.cons_doctor) `;
    let countQuery = ` select count(transactions.id) as total from transactions
    left join patients on patients.id = transactions.patient_id
  left join visit_details on visit_details.opd_details_id = transactions.opd_id
  left join ipd_details on ipd_details.id = transactions.ipd_id
  left join staff on staff.id = (ipd_details.cons_doctor or visit_details.cons_doctor) `

    let values: any = []
    if (search) {
      query += ` where transactions.payment_mode like ? or transactions.section like ? or patients.patient_name like ? or staff.name like ? or staff.surname like ?`
      countQuery += ` where transactions.payment_mode like ? or transactions.section like ? or patients.patient_name like ? or staff.name like ? or staff.surname like ?`
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)

    }
    query += ` limit  ${limit} offset ${offset} `

    const getHeader = await this.connection.query(`SELECT 
  transactions.payment_mode,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount 
FROM transactions
group by payment_mode`)

    const getValue = await this.connection.query(query, values);
    const getCount = await this.connection.query(countQuery, values);
    let out = {
      details: getValue,
      count: getCount[0]?.total ?? 0,
      header :getHeader
    }
    return out;
  }

  async findAll(limit: number, page: number, search: string) {
    const offset = limit * (page - 1);
    let query = ` SELECT 
  DATE_FORMAT(payment_date, '%Y-%m-%d') AS paymentDate,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount,
  SUM(IF(LOWER(section) = 'appointment', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS appointmentAmount,
  SUM(IF(LOWER(section) = 'opd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS opdAmount,
  SUM(IF(LOWER(section) = 'ipd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS ipdAmount,
  SUM(IF(LOWER(section) NOT IN ('opd', 'ipd','appointment'), IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS otherAmount
FROM transactions
`
    let countQuery = ` SELECT COUNT(DISTINCT DATE(payment_date)) AS total
FROM transactions  `
    let values = []
    if (search) {
      query += ` where DATE(payment_date) like ?`
      countQuery += ` where DATE(payment_date) like ?`
      values.push(`%${search}%`)
    }
    query += ` GROUP BY DATE(payment_date)
ORDER BY DATE(payment_date) limit ${limit} offset ${offset}  `

    const getHeader = await this.connection.query(`SELECT 
  transactions.payment_mode,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount 
FROM transactions
group by payment_mode`)

    let reslt = await this.connection.query(query, values);
    let count = await this.connection.query(countQuery, values);

    let out = {
      details: reslt,
      count: count[0]?.total ?? 0,
      header: getHeader
    }
    return out;
  }


  async findAllPerMonth(limit: number, page: number) {
    const offset = limit * (page - 1);
    let query = ` SELECT 
  DATE_FORMAT(payment_date, '%Y-%m') AS paymentMonth,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount
  -- ,
--  SUM(IF(LOWER(section) = 'appointment', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS appointmentAmount,
 -- SUM(IF(LOWER(section) = 'opd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS opdAmount,
 -- SUM(IF(LOWER(section) = 'ipd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS ipdAmount,
--  SUM(IF(LOWER(section) NOT IN ('opd', 'ipd', 'appointment'), IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS otherAmount
FROM transactions


`
    let countQuery = ` SELECT COUNT(DISTINCT DATE_FORMAT(payment_date, '%Y-%m')) AS total
FROM transactions   `
    let values = []

    query += ` GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY paymentMonth limit ${limit} offset ${offset}  `

    const getHeader = await this.connection.query(`SELECT 
  transactions.payment_mode,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount 
FROM transactions
group by payment_mode`)
    let reslt = await this.connection.query(query, values);
    let count = await this.connection.query(countQuery, values);

    let out = {
      details: reslt,
      count: count[0]?.total ?? 0,
      header: getHeader
    }
    return out;
  }


  async findAllPerDoctor(limit: number, page: number,search: string) {
    const offset = limit * (page - 1);
    let query = ` SELECT 
  staff.name AS staff_first_name,
  staff.surname AS staff_last_name,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount,
  SUM(IF(LOWER(section) = 'appointment', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS appointmentAmount,
  SUM(IF(LOWER(section) = 'opd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS opdAmount,
  SUM(IF(LOWER(section) = 'ipd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS ipdAmount,
  SUM(IF(LOWER(section) NOT IN ('opd', 'ipd', 'appointment'), IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS otherAmount
FROM transactions
LEFT JOIN visit_details ON visit_details.opd_details_id = transactions.opd_id
LEFT JOIN ipd_details ON ipd_details.id = transactions.ipd_id
LEFT JOIN staff ON staff.id = COALESCE(ipd_details.cons_doctor, visit_details.cons_doctor)

`
    let countQuery = `SELECT 
  COUNT(DISTINCT staff.id) AS total
FROM transactions
LEFT JOIN visit_details ON visit_details.opd_details_id = transactions.opd_id
LEFT JOIN ipd_details ON ipd_details.id = transactions.ipd_id
LEFT JOIN staff ON staff.id = COALESCE(ipd_details.cons_doctor, visit_details.cons_doctor)
   `
    let values = []
    if(search){
      query += ` where staff.name like ? or staff.surname like ?`
      countQuery += ` where staff.name like ? or staff.surname like ?`
      values.push(`%${search}%`, `%${search}%`)

    }

    query += ` GROUP BY staff.id
ORDER BY  staff_first_name limit ${limit} offset ${offset}  `

    const getHeader = await this.connection.query(`SELECT 
  transactions.payment_mode,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount 
FROM transactions
group by payment_mode`)

    let reslt = await this.connection.query(query, values);
    let count = await this.connection.query(countQuery, values);

    let out = {
      details: reslt,
      count: count[0]?.total ?? 0,
      header : getHeader
    }
    return out;
  }

    async findAllPerPatient(limit: number, page: number,search: string) {
    const offset = limit * (page - 1);
    let query = ` SELECT 
    patients.patient_name,
    patients.id as patient_id,
    patients.mobileno,
    patients.gender,
    patients.age,
    patients.dob,
    patients.address,
    patients.state_name,
    patients.district_name,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount,
  SUM(IF(LOWER(section) = 'appointment', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS appointmentAmount,
  SUM(IF(LOWER(section) = 'opd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS opdAmount,
  SUM(IF(LOWER(section) = 'ipd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS ipdAmount,
  SUM(IF(LOWER(section) NOT IN ('opd', 'ipd', 'appointment'), IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS otherAmount
FROM transactions
LEFT JOIN patients ON patients.id = transactions.patient_id

`
    let countQuery = `SELECT 
  COUNT(DISTINCT patients.id) AS total
FROM transactions
LEFT JOIN patients ON patients.id = transactions.patient_id
   `
    let values = []
    if(search){
      query += ` where  patients.patient_name like ? or patients.id like ? or patients.mobileno like ? or patients.address ? or patients.state_name ?`
      countQuery += ` where  patients.patient_name like ? or patients.id like ? or patients.mobileno like ? or patients.address ? or patients.state_name ? `
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)

    }

    query += ` GROUP BY patients.id
ORDER BY patients.patient_name limit ${limit} offset ${offset}  `

    const getHeader = await this.connection.query(`SELECT 
  transactions.payment_mode,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount 
FROM transactions
group by payment_mode`)

    let reslt = await this.connection.query(query, values);
    let count = await this.connection.query(countQuery, values);

    let out = {
      details: reslt,
      count: count[0]?.total ?? 0,
      header : getHeader
    }
    return out;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpIncomeReport`;
  }

  update(id: number, updatePhpIncomeReportDto: UpdatePhpIncomeReportDto) {
    return `This action updates a #${id} phpIncomeReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpIncomeReport`;
  }
}
