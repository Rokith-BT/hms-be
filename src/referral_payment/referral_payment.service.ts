import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ReferralPayment } from "./entities/referral_payment.entity";

@Injectable()
export class ReferralPaymentService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createReferralPayment: ReferralPayment) {
    try {
      const currentDate = new Date();
      const [patientId] = await this.connection.query('SELECT email FROM patients WHERE id = ?', [createReferralPayment.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createReferralPayment.patient_id} not found.`);
      } const Email = patientId.email;
      const addReferralPayment = await this.connection.query(
        `INSERT into referral_payment(
          referral_person_id,
          patient_id,
          referral_type,
          billing_id,
          bill_amount,
          percentage,
          amount,
          date
      ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          createReferralPayment.referral_person_id,
          createReferralPayment.patient_id,
          createReferralPayment.referral_type,
          createReferralPayment.billing_id,
          createReferralPayment.bill_amount,
          createReferralPayment.percentage,
          createReferralPayment.amount,
          currentDate
        ],
      )
      const addedReferralPaymentId = addReferralPayment.insertId;

      const AdminreferralPerson = await this.dynamicConnection.query('SELECT id FROM referral_person WHERE hos_referral_person_id = ? and Hospital_id = ?', [createReferralPayment.referral_person_id, createReferralPayment.Hospital_id]);
      const AdminReferralPersonid = AdminreferralPerson[0].id;
      const AdminpatientId = await this.dynamicConnection.query('SELECT id FROM patients WHERE email = ?', [Email]);
      const AdminPATIENTId = AdminpatientId[0].id;
      const AdminreferralType = await this.dynamicConnection.query('SELECT id FROM referral_type WHERE hospital_referral_type_id = ? and Hospital_id = ?', [createReferralPayment.referral_type, createReferralPayment.Hospital_id]);
      const AdminReferralTypeid = AdminreferralType[0].id;
      const AdminBilling = await this.dynamicConnection.query('SELECT id FROM transactions WHERE hos_transaction_id = ? and Hospital_id = ?', [createReferralPayment.billing_id, createReferralPayment.Hospital_id]);
      const AdminBillingID = AdminBilling[0].id;
      await this.dynamicConnection.query(
        `INSERT into referral_payment(
          referral_person_id,
          patient_id,
          referral_type,
          billing_id,
          bill_amount,
          percentage,
          amount,
          date,
          Hospital_id,
          hos_referral_payment_id
     ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          AdminReferralPersonid,
          AdminPATIENTId,
          AdminReferralTypeid,
          AdminBillingID,
          createReferralPayment.bill_amount,
          createReferralPayment.percentage,
          createReferralPayment.amount,
          currentDate,
          createReferralPayment.Hospital_id,
          addedReferralPaymentId
        ],
      )
      return [{
        "data ": {
          status: "success",
          "messege": "Referral payment added successfully ",
          "Added_values": await this.connection.query('SELECT * FROM referral_payment WHERE id = ?', [addedReferralPaymentId])
        }
      }];

    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
  async findopdidcaseid(patient_id: number, section: string): Promise<ReferralPayment> {
    try {
       const getopdIDcaseID = await this.connection.query(`SELECT concat('OPDN',"",transactions.opd_id,"/ ",transactions.case_reference_id) as Billno from transactions where patient_id = ? and section = ?`, [patient_id, section]);
    return getopdIDcaseID;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }

   
  }




  async findrefPatBillAmount(opd_id: string, case_reference_id: string): Promise<ReferralPayment> {
    try {
       const getTransactionAmt = await this.connection.query(`SELECT amount from transactions where opd_id = ? and case_reference_id = ?`, [opd_id, case_reference_id]);
    return getTransactionAmt;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }


  async getCommissionAmount(id: number, amount: number): Promise<ReferralPayment> {
    try {
       const result = await this.connection.query(
      `SELECT
                standard_commission,
                ROUND((? * standard_commission / 100), 2) AS standard_commission_amount
            FROM
                referral_person
            WHERE
                id = ?`,
      [amount, id],
    );
    return result;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async findAll() {
    try {
       const referralPaymentList = await this.connection.query(`SELECT rp1.name AS referral_person_name, CONCAT(p.patient_name, ' (', rp.patient_id, ')') AS PatientName,concat('OPDN',"",rp.id) AS Bill_No, rp.bill_amount, rp.percentage AS commission_percentage, rp.amount AS commission_amount_fixed FROM referral_payment rp 
          LEFT JOIN referral_person rp1 ON rp.referral_person_id = rp1.id LEFT JOIN patients p ON rp.patient_id = p.id`);
    return referralPaymentList;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }
  async ReferralPaymentSearch(search: string): Promise<ReferralPayment[]> {
    try {
       let query = ` SELECT rp1.name AS referral_person_name, CONCAT(p.patient_name, ' (', rp.patient_id, ')') AS PatientName,concat('OPDN',"",rp.id) AS Bill_No, rp.bill_amount, rp.percentage AS commission_percentage, rp.amount AS commission_amount_fixed FROM referral_payment rp 
          LEFT JOIN referral_person rp1 ON rp.referral_person_id = rp1.id LEFT JOIN patients p ON rp.patient_id = p.id
       `
    let values = []
    if (search) {
      query += ` WHERE (rp1.name LIKE ? OR CONCAT(p.patient_name, ' (', rp.patient_id, ')') LIKE ? OR concat('OPDN',"",rp.id) LIKE ? OR rp.bill_amount LIKE ? OR rp.percentage LIKE ? OR rp.amount LIKE ? )  `
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
      values.push("%" + search + "%")
    }
    let final = query;
    const refPaymentSearch = await this.connection.query(final, values);
    return refPaymentSearch;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }






  async remove(referral_payment_id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM referral_payment WHERE id = ?', [referral_payment_id]);
      const adminreferralPayment = await this.dynamicConnection.query(`select id from referral_payment where hos_referral_payment_id = ? and Hospital_id = ?`, [referral_payment_id, Hospital_id]);
      const adminReferralPaymentID = adminreferralPayment[0].id;
      await this.dynamicConnection.query(`delete from referral_payment where id = ?`, [adminReferralPaymentID])
      return [{
        status: process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
      }
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }




  async update(id: number, createReferralPayment: ReferralPayment) {

    try {
      await this.connection.query(
        `UPDATE referral_payment SET
              percentage=?,
              amount=?
              WHERE id = ?
              `,
        [
          createReferralPayment.percentage,
          createReferralPayment.amount,
          id
        ],
      )
      const dynnnAdminrefPaymentid = await this.dynamicConnection.query('SELECT id FROM referral_payment WHERE hos_referral_payment_id = ? and Hospital_id = ?', [id, createReferralPayment.Hospital_id]);
      const dynnnAdminrefPaymentidddd = dynnnAdminrefPaymentid[0].id;
       await this.dynamicConnection.query(
        `UPDATE referral_payment SET
              percentage=?,
              amount=?,
              Hospital_id=?
              WHERE id = ?
              `,
        [
          createReferralPayment.percentage,
          createReferralPayment.amount,
          createReferralPayment.Hospital_id,
          dynnnAdminrefPaymentidddd
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.REFERRAL_PAYMENT,
          "Updated_values": await this.connection.query('SELECT * FROM referral_payment WHERE id = ?', [id])
        }
      }];
    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

}