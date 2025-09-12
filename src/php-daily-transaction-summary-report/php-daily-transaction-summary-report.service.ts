import { Injectable } from '@nestjs/common';
import { CreatePhpDailyTransactionSummaryReportDto } from './dto/create-php-daily-transaction-summary-report.dto';
import { UpdatePhpDailyTransactionSummaryReportDto } from './dto/update-php-daily-transaction-summary-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
const Razorpay = require('razorpay');

@Injectable()
export class PhpDailyTransactionSummaryReportService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }
  async create(createPhpDailyTransactionSummaryReportDto: CreatePhpDailyTransactionSummaryReportDto) {
    try {
      const getDetails = await this.connection.query(`SELECT 
  COUNT(id) AS totalcount,
  SUM(LOWER(section) = 'opd') AS opdcount,
  SUM(LOWER(section) = 'ipd') AS ipdcount,
  SUM(LOWER(section) = 'Appointment') AS appointmentCount,
  SUM(LOWER(section) NOT IN ('opd', 'ipd','appointment')) AS othercount
FROM transactions 
WHERE DATE(payment_date) BETWEEN DATE(?) AND DATE(?)
`, [createPhpDailyTransactionSummaryReportDto.fromDate, createPhpDailyTransactionSummaryReportDto.toDate]);

      const get_full_details = await this.connection.query(`SELECT 
  DATE_FORMAT(payment_date, '%Y-%m-%d') AS paymentDate,
  SUM(IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) AS totalAmount,
  SUM(IF(LOWER(section) = 'appointment', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS appointmentAmount,
  SUM(IF(LOWER(section) = 'opd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS opdAmount,
  SUM(IF(LOWER(section) = 'ipd', IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS ipdAmount,
  SUM(IF(LOWER(section) NOT IN ('opd', 'ipd','appointment'), IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0), 0)) AS otherAmount
FROM transactions
WHERE DATE(payment_date) BETWEEN DATE(?) AND DATE(?)
GROUP BY DATE(payment_date)
ORDER BY DATE(payment_date);
;
`, [createPhpDailyTransactionSummaryReportDto.fromDate,
      createPhpDailyTransactionSummaryReportDto.toDate])
      let out = {
        counts: getDetails,
        details: get_full_details
      }
      return out;
    } catch (error) {
      return error;
    }
  }

  async findAll(section: string, date: string) {
    console.log(section, date);
    switch (section.toLocaleLowerCase()) {
      case 'opd': {
        const getSectionDetails = this.connection.query(`SELECT transactions.id,
    'OPD' AS section,
    transactions.opd_id AS section_id,
    transactions.payment_date,
    patients.patient_name,
    coalesce(staff.name,"-") as staff_first_name,
    coalesce(staff.surname,"-") as staff_last_name,
    (IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) amount,
    transactions.payment_mode,
    transactions.received_by_name
    FROM transactions
    left join patients on patients.id = transactions.patient_id
    left join visit_details on visit_details.opd_details_id = transactions.opd_id
    left join staff on staff.id = visit_details.cons_doctor
    WHERE LOWER(transactions.section) = 'opd' and DATE(transactions.payment_date)  = DATE(?)
    `, [date])
        return getSectionDetails;
      }
      case 'ipd': {
        const getSectionDetails = this.connection.query(`SELECT transactions.id,
        'IPD' AS section,
        transactions.ipd_id AS section_id,
        transactions.payment_date,
        patients.patient_name,
        coalesce(staff.name,"-") as staff_first_name,
        coalesce(staff.surname,"-") as staff_last_name,
        (IFNULL(amount, 0) + IFNULL(temp_appt_amount, 0)) amount,
        transactions.payment_mode,
        transactions.received_by_name
        FROM transactions
        left join patients on patients.id = transactions.patient_id
        left join ipd_details on ipd_details.id = transactions.ipd_id
        left join staff on staff.id = ipd_details.cons_doctor
        WHERE LOWER(transactions.section) = 'ipd' and DATE(transactions.payment_date)  = DATE(?)
        `, [date])
        return getSectionDetails;
      }
      case 'appointment': {
        const getSectionDetails = this.connection.query(`SELECT transactions.id,
        'Appointment' AS section,
        transactions.appointment_id AS section_id,
        transactions.payment_date,
        patients.patient_name,
        coalesce(staff.name,"-") as staff_first_name,
        coalesce(staff.surname,"-") as staff_last_name,
        (IFNULL(transactions.amount, 0) + IFNULL(transactions.temp_appt_amount, 0)) amount,
        transactions.payment_mode,
        transactions.received_by_name
        FROM transactions
        left join patients on patients.id = transactions.patient_id
        left join appointment on appointment.id = transactions.appointment_id
        left join staff on staff.id = appointment.doctor
        WHERE LOWER(transactions.section) = 'appointment' and DATE(transactions.payment_date)  = DATE(?)
        `, [date])
        return getSectionDetails;
      }
      case 'other':
        {
          const getSectionDetails = this.connection.query(`SELECT transactions.id,
          'Payment' AS section,
          transactions.appointment_id AS section_id,
          transactions.payment_date,
          patients.patient_name,
          coalesce(staff.name ,"-") as staff_first_name,
          coalesce(staff.surname,"-") as staff_last_name,
          (IFNULL(transactions.amount, 0) + IFNULL(transactions.temp_appt_amount, 0)) amount,
          transactions.payment_mode,
          transactions.received_by_name
          FROM transactions
          left join patients on patients.id = transactions.patient_id
          left join appointment on appointment.id = transactions.appointment_id
          left join staff on staff.id = appointment.doctor
          WHERE LOWER(transactions.section) = 'payment' and DATE(transactions.payment_date)  = DATE(?)
          `, [date])
          return getSectionDetails;

        }
      default: {
        const getSectionDetails = this.connection.query(`SELECT transactions.id,
        'Payment' AS section,
        transactions.appointment_id AS section_id,
        transactions.payment_date,
        patients.patient_name,
        coalesce(staff.name ,"-") as staff_first_name,
        coalesce(staff.surname) as staff_last_name,
        (IFNULL(transactions.amount, 0) + IFNULL(transactions.temp_appt_amount, 0)) amount,
        transactions.payment_mode,
        transactions.received_by_name
        FROM transactions
        left join patients on patients.id = transactions.patient_id
        left join appointment on appointment.id = transactions.appointment_id
        left join staff on staff.id = appointment.doctor
        WHERE LOWER(transactions.section) = 'payment' and DATE(transactions.payment_date)  = DATE(?)
        `, [date])
        return getSectionDetails;
      }
    }

  }



 async findOne(id: string,hospital_id: string) {

    let trnId;
    try {
      trnId = id.replace(/[a-zA-Z]/g, "");
    } catch (error) {
      trnId = id;
    }
    try {
      const [getHosDetails] = await this.dynamicConnection.query(
        `select hospitals.hospital_name,
    hospitals.contact_no,
    concat( coalesce( hospitals.address)," ",
     coalesce( hospitals.state,"")," ",
     coalesce(hospitals.district,"")," ",coalesce(hospitals.pincode,"")) address,
     hospitals.website,
     hospitals.email
     from hospitals where plenome_id =? `,
        [hospital_id]
      );
      const [getTranPat_id] = await this.connection.query(
        `select * from transactions where id = ?`,
        [trnId]
      );     
      const [patDetails] = await this.connection.query(
        `select id as patient_id,
        patient_name,
        dob,
        mobileno,
        age,
        gender
        from patients where id = ?`,
        [getTranPat_id.patient_id]
      );
      const transactionDetails = await this.connection.query(`
      select patient_charges.qty,
      coalesce(patient_charges.standard_charge,0)standard_charge,
      coalesce(patient_charges.tax,0) taxPercentage,
      case when patient_charges.payment_status <> 'partially_paid' then 
      format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else
      format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,
      patient_charges.additional_charge,
      coalesce(patient_charges.discount_amount,0)discount_amount,
      coalesce(patient_charges.discount_percentage)discount_percentage,
      coalesce(patient_charges.total,0)total,
      coalesce(charges.name,"") chargeName,
      staff.name as doctor_first_name,
      transactions.payment_mode,
      transactions.payment_date,
      staff.surname as doctor_last_name
      from patient_charges
      left join charges on patient_charges.charge_id = charges.id
      left join ipd_details on ipd_details.id = patient_charges.ipd_id
      left join visit_details on visit_details.patient_charge_id = patient_charges.id
      left join staff on (staff.id = visit_details.cons_doctor or staff.id = ipd_details.cons_doctor)
      left join transactions on transactions.id = patient_charges.transaction_id
      where patient_charges.transaction_id = ?
      `,
        [trnId]
      );
      
      let out: any = {
        patientDetails: patDetails,
        hospitalDetails: getHosDetails,
        invoiceDetails: transactionDetails,
        total: getTranPat_id.amount,
        received_by_name: getTranPat_id.received_by_name
      }
      const [tempApptPaymentDetails] = await this.connection.query(`select temp_appt_amount,
        temp_appt_payment_id,
        temp_appt_payment_gateway from transactions where id = ${trnId} `)

      if (tempApptPaymentDetails?.temp_appt_payment_gateway?.trim().toLocaleLowerCase() == 'razorpay') {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const paymentDetails = await razorpay.payments.fetch(tempApptPaymentDetails.temp_appt_payment_id);

        const tempPayDetails = {
          payment_method: "Online",
          payment_gateway: tempApptPaymentDetails.temp_appt_payment_gateway,
          payment_details: paymentDetails,
        }
        out.tempPayDetails = tempPayDetails
      }
      return [out];
    } catch (error) {
      console.log(error, "error");

      return error;
    }  }

  update(id: number, updatePhpDailyTransactionSummaryReportDto: UpdatePhpDailyTransactionSummaryReportDto) {
    return `This action updates a #${id} phpDailyTransactionSummaryReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} phpDailyTransactionSummaryReport`;
  }
}
