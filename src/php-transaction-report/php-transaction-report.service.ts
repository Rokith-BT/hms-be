import { Injectable } from '@nestjs/common';
import { CreatePhpTransactionReportDto, CreatePhpTransactionReportResponseDto } from './dto/create-php-transaction-report.dto';
import { UpdatePhpTransactionReportDto } from './dto/update-php-transaction-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhpTransactionReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }


//   async create(createPhpTransactionReportDto: CreatePhpTransactionReportDto,limit:number,page:number,search:any,filter:string):Promise<CreatePhpTransactionReportResponseDto> {
//     const offset = limit * (page - 1);
//  try {
//   let query = `SELECT 
//   transactions.*,
//   CASE 
//       WHEN ipd_id IS NOT NULL THEN 'ipd_no'
//       WHEN opd_id IS NOT NULL THEN 'opd_no'
//       WHEN pharmacy_bill_basic_id IS NOT NULL THEN 'pharmacy_billing'
//       WHEN pathology_billing_id IS NOT NULL THEN 'pathology_billing'
//       WHEN radiology_billing_id IS NOT NULL THEN 'radiology_billing'
//       WHEN blood_issue_id IS NOT NULL THEN 'blood_bank_billing'
//       WHEN ambulance_call_id IS NOT NULL THEN 'ambulance_call_billing'
//   END AS ward,
//   CASE 
//       WHEN ipd_id IS NOT NULL THEN ipd_id   
//       WHEN opd_id IS NOT NULL THEN opd_id
//       WHEN pharmacy_bill_basic_id IS NOT NULL THEN pharmacy_bill_basic_id
//       WHEN pathology_billing_id IS NOT NULL THEN pathology_billing_id
//       WHEN radiology_billing_id IS NOT NULL THEN radiology_billing_id
//       WHEN blood_issue_id IS NOT NULL THEN blood_issue_id
//       WHEN ambulance_call_id IS NOT NULL THEN ambulance_call_id
//   END AS reference,
//   section,
//   transactions.opd_id AS module_id,
//   patients.patient_name,
//   patients.id AS patient_id,
//   'opd' AS head,
//   'opd_no' AS module_no,
//   staff.name,
//   staff.surname,
//   staff.employee_id
// FROM transactions
// LEFT JOIN ipd_details ON ipd_details.id = transactions.ipd_id
// LEFT JOIN patients ON patients.id = transactions.patient_id
// LEFT JOIN opd_details ON opd_details.id = transactions.opd_id
// LEFT JOIN pharmacy_bill_basic ON pharmacy_bill_basic.id = transactions.pharmacy_bill_basic_id
// LEFT JOIN pathology_billing ON pathology_billing.id = transactions.pathology_billing_id
// LEFT JOIN radiology_billing ON radiology_billing.id = transactions.radiology_billing_id
// LEFT JOIN blood_issue ON blood_issue.id = transactions.blood_issue_id
// LEFT JOIN staff ON staff.id = transactions.received_by
// WHERE DATE(transactions.payment_date) >= DATE(?)
// AND DATE(transactions.payment_date) <= DATE(?)

//  `
// let values = [createPhpTransactionReportDto.startDate, createPhpTransactionReportDto.endDate]
// let countQuery = `SELECT COUNT(*) as total from transactions
// left join patients on patients.id = transactions.patient_id where DATE(transactions.payment_date) >= DATE(?)
// AND DATE(transactions.payment_date) <= DATE(?) `

// if (filter) {
//       query += ` AND transactions.received_by_name = ? `;
//             countQuery += ` AND transactions.received_by_name = ? `;

//       values.push(filter);
    
   
    
    
// }


//   if(search){
//     query += ` AND (transactions.id LIKE ? OR patients.patient_name LIKE ? OR transactions.received_by_name LIKE ?)`

//     countQuery += ` AND (transactions.id LIKE ? OR patients.patient_name LIKE ? OR transactions.received_by_name LIKE ?)`

//     values.push(`%${search}%`, `%${search}%`, `%${search}%`);
//   }


 
 
//   const getTransactionDetais = await this.connection.query(query + ` ORDER BY transactions.payment_date DESC limit ${limit} offset ${offset}`, values);


//     const [count] = await this.connection.query(countQuery, values);
// let output = {
//   total: count.total,
//   details : getTransactionDetais
// }
//   return output;
//  } catch (error) {
//   console.log(error,"error in transaction report");
  
//   return error;
//  }
//   }


async create(
  createPhpTransactionReportDto: CreatePhpTransactionReportDto,
  limit: number,
  page: number,
  search: any,
  filter: string
): Promise<CreatePhpTransactionReportResponseDto> {
  const offset = limit * (page - 1);

  try {
    let query = `
      SELECT 
        transactions.*,
        CASE 
            WHEN ipd_id IS NOT NULL THEN 'ipd_no'
            WHEN opd_id IS NOT NULL THEN 'opd_no'
            WHEN pharmacy_bill_basic_id IS NOT NULL THEN 'pharmacy_billing'
            WHEN pathology_billing_id IS NOT NULL THEN 'pathology_billing'
            WHEN radiology_billing_id IS NOT NULL THEN 'radiology_billing'
            WHEN blood_issue_id IS NOT NULL THEN 'blood_bank_billing'
            WHEN ambulance_call_id IS NOT NULL THEN 'ambulance_call_billing'
        END AS ward,
        CASE 
            WHEN ipd_id IS NOT NULL THEN ipd_id   
            WHEN opd_id IS NOT NULL THEN opd_id
            WHEN pharmacy_bill_basic_id IS NOT NULL THEN pharmacy_bill_basic_id
            WHEN pathology_billing_id IS NOT NULL THEN pathology_billing_id
            WHEN radiology_billing_id IS NOT NULL THEN radiology_billing_id
            WHEN blood_issue_id IS NOT NULL THEN blood_issue_id
            WHEN ambulance_call_id IS NOT NULL THEN ambulance_call_id
        END AS reference,
        section,
        transactions.opd_id AS module_id,
        patients.patient_name,
        patients.id AS patient_id,
        'opd' AS head,
        'opd_no' AS module_no,
        staff.name,
        staff.surname,
        staff.employee_id,

        -- Get appointment.id by joining through case_references
        COALESCE(ipd_appointment.id, opd_appointment.id) AS appointment_id

      FROM transactions

      -- IPD joins
      LEFT JOIN ipd_details ON ipd_details.id = transactions.ipd_id
      LEFT JOIN case_references AS ipd_case_ref ON ipd_case_ref.id = ipd_details.case_reference_id
      LEFT JOIN appointment AS ipd_appointment ON ipd_appointment.case_reference_id = ipd_case_ref.id

      -- OPD joins
      LEFT JOIN opd_details ON opd_details.id = transactions.opd_id
      LEFT JOIN case_references AS opd_case_ref ON opd_case_ref.id = opd_details.case_reference_id
      LEFT JOIN appointment AS opd_appointment ON opd_appointment.case_reference_id = opd_case_ref.id

      -- Other joins
      LEFT JOIN patients ON patients.id = transactions.patient_id
      LEFT JOIN pharmacy_bill_basic ON pharmacy_bill_basic.id = transactions.pharmacy_bill_basic_id
      LEFT JOIN pathology_billing ON pathology_billing.id = transactions.pathology_billing_id
      LEFT JOIN radiology_billing ON radiology_billing.id = transactions.radiology_billing_id
      LEFT JOIN blood_issue ON blood_issue.id = transactions.blood_issue_id
      LEFT JOIN staff ON staff.id = transactions.received_by

      WHERE DATE(transactions.payment_date) >= DATE(?)
      AND DATE(transactions.payment_date) <= DATE(?)
    `;

    const values = [createPhpTransactionReportDto.startDate, createPhpTransactionReportDto.endDate];

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM transactions
      LEFT JOIN patients ON patients.id = transactions.patient_id 
      WHERE DATE(transactions.payment_date) >= DATE(?)
      AND DATE(transactions.payment_date) <= DATE(?)
    `;

    if (filter) {
      query += ` AND transactions.received_by_name = ? `;
      countQuery += ` AND transactions.received_by_name = ? `;
      values.push(filter);
    }

    if (search) {
      query += `
        AND (
          transactions.id LIKE ? OR 
          patients.patient_name LIKE ? OR 
          transactions.received_by_name LIKE ?
        )
      `;
      countQuery += `
        AND (
          transactions.id LIKE ? OR 
          patients.patient_name LIKE ? OR 
          transactions.received_by_name LIKE ?
        )
      `;
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY transactions.payment_date DESC LIMIT ${limit} OFFSET ${offset}`;

    const getTransactionDetails = await this.connection.query(query, values);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      total: countResult.total,
      details: getTransactionDetails,
    };
  } catch (error) {
    console.error("Error in transaction report", error);
    throw error;
  }
}



  findAll() {
    return `This action returns all phpTransactionReport`;
  }


  update(id: number, updatePhpTransactionReportDto: UpdatePhpTransactionReportDto) {
    return `This action updates a #${id} phpTransactionReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpTransactionReport`;
  }

  async findcollected_by(){
    try {
      console.log("service called");
      
      const results = await this.connection.query(`SELECT distinct transactions.received_by_name FROM transactions `);
      return results;
    } catch (error) {
      console.error('Error fetching collected by details:', error);
      throw error;
    }
  }
}
