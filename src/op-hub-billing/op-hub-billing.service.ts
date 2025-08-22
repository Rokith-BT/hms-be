import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AddCharge,
  makepayment,
  makepaymentV3,
  UpdateCharge,
} from './entities/op-hub-billing.entity';
import { PatientBalanceDtoWithCount } from './dto/create-op-hub-billing.dto';
import { PatientTransactionDtoWithCount } from './dto/update-op-hub-billing.dto';
const Razorpay = require('razorpay');

@Injectable()
export class OpHubBillingService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(Entity: AddCharge) {
    try {
      const insertIntoPatientCharges = await this.dynamicConnection.query(
        ` insert into patient_charges(
      date,
      qty,
      charge_id,
      standard_charge,
      tpa_charge,
      tax,
      apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total,
    discount_percentage,
    discount_amount,
    additional_charge,
    additional_charge_note
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) `,
        [
          Entity.date,
          Entity.qty,
          Entity.charge_id,
          Entity.standard_charge,
          0.0,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.note,
          'unpaid',
          Entity.patient_id,
          Entity.total,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
        ],
      );

      const [getAdminCharge_id] = await this.connection.query(
        `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
        [Entity.Hospital_id, Entity.charge_id],
      );

      const [getHosPatientMob] = await this.dynamicConnection.query(
        `select mobileno from patients where id = ? `,
        [Entity.patient_id],
      );

      const [getAdminPatid] = await this.connection.query(
        `select id from patients where mobileno = ?`,
        [getHosPatientMob.mobileno],
      );

      await this.connection.query(
        ` insert into patient_charges(
      date,
      qty,
      charge_id,
      standard_charge,
      tpa_charge,
      tax,
      apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total,
    Hospital_id,
    hos_patient_charges_id,

    discount_percentage,
    discount_amount,
    additional_charge,
    additional_charge_note
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) `,
        [
          Entity.date,
          Entity.qty,
          getAdminCharge_id.id,
          Entity.standard_charge,
          0.0,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.note,
          'unpaid',
          getAdminPatid.id,
          Entity.amount,
          Entity.Hospital_id,
          insertIntoPatientCharges.insertId,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
        ],
      );

      return {
        status: 'success',
        message: 'charges added successfully.',
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findAll(
    hospital_id: number,
    from_date: any,
    to_date: any,
    patient_id: any,
    payment_method: any,
    date: any,
  ) {
    try {
      let query = `   select patients.id patientId,    concat("PT",patients.id) plenome_patient_id,
patients.patient_name,
     concat("TRID",transactions.id) transaction_id,
     date(transactions.payment_date) payment_date,
     transactions.payment_mode,
      CASE
         WHEN transactions.amount is not null THEN transactions.amount
         ELSE transactions.temp_appt_amount
     END AS amount
     from transactions
     left join patients on patients.id = transactions.patient_id
     left join patient_charges on patient_charges.id = transactions.patient_charges_id
     where transactions.id 
     `;
      let values = [];

      if (from_date || to_date) {
        if (from_date) {
          query += ` and  transactions.payment_date >= ? `;
          values.push(from_date);
        }
        if (to_date) {
          query += ` and  transactions.payment_date <= ? `;
          values.push(to_date);
        }
      } else if (date) {
        query += ` and date(transactions.payment_date) = date(?) `;
        values.push(date);
      }

      if (patient_id) {
        query += ` and  transactions.patient_id = ? `;
        values.push(patient_id);
      }
      if (payment_method) {
        query += ` and  transactions.payment_mode = ? `;
        values.push(payment_method);
      }

      const getTransactionDetails = await this.dynamicConnection.query(
        query,
        values,
      );

      getTransactionDetails.forEach(async (transaction) => {
        let date = transaction.payment_date;
        let formattedDate;
        if (transaction.payment_date) {
          formattedDate = date.toISOString().split('T')[0];
        } else {
          formattedDate = transaction.payment_date;
        }

        transaction.payment_date = await formattedDate;
      });
      const overallTotal = getTransactionDetails.reduce(
        (sum, current) => sum + current.amount,
        0,
      );

      return {
        status: 'success',
        message: 'details fetched successfully.',
        details: getTransactionDetails,
        count: getTransactionDetails.length,
        overallTotal: parseFloat(overallTotal.toFixed(3)),
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async getInvoice(transaction_id: any, hospital_id: number) {
    let trnId;
    try {
      trnId = transaction_id.replace(/[a-zA-Z]/g, '');
    } catch (error) {
      trnId = transaction_id;
    }
    try {
      const [getPaymentDetails] = await this.dynamicConnection.query(
        `    SELECT 
    CONCAT('TRID', transactions.id) AS transaction_id,
    DATE(transactions.payment_date) AS payment_date,
    transactions.payment_mode,
    transactions.payment_method,
    transactions.card_division,
    transactions.card_type,
    transactions.card_transaction_id,
    transactions.card_bank_name,
    transactions.net_banking_division,
    transactions.net_banking_transaction_id,
    transactions.upi_id,
    transactions.upi_bank_name,
    transactions.upi_transaction_id,
            concat(COALESCE(transactions.net_banking_transaction_id,""),COALESCE(transactions.card_transaction_id,""),COALESCE(transactions.upi_transaction_id,""),
            COALESCE(transactions.payment_reference_number,""),
            COALESCE(transactions.cash_transaction_id,"")) payment_transaction_id
FROM transactions
WHERE id = ?
`,
        [trnId],
      );
      const [getHosDetails] = await this.connection.query(
        `select hospitals.hospital_name,
    hospitals.contact_no,
    concat( coalesce( hospitals.address)," ",
     coalesce( hospitals.state,"")," ",
     coalesce(hospitals.district,"")," ",coalesce(hospitals.pincode,"")) address,
     hospitals.website,
     hospitals.email
     from hospitals where plenome_id =? `,
        [hospital_id],
      );
      const [getTranPat_id] = await this.dynamicConnection.query(
        `select * from transactions where id = ?`,
        [trnId],
      );
      const [patDetails] = await this.dynamicConnection.query(
        `select * from patients where id = ?`,
        [getTranPat_id.patient_id],
      );
      const transactionDetails = await this.dynamicConnection.query(
        `
     
 select patient_charges.qty,
      coalesce(patient_charges.standard_charge,0)standard_charge,
      coalesce(patient_charges.tax,0) taxPercentage,
case when patient_charges.payment_status <> 'partially_paid' then
format(((((patient_charges.standard_charge * patient_charges.qty) + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) else 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) 
             end taxAmount,  
               patient_charges.additional_charge,
     coalesce(patient_charges.discount_amount,0)discount_amount,
     coalesce(patient_charges.discount_percentage)discount_percentage,
     coalesce(patient_charges.total,0)total,
     coalesce(charges.name,"") chargeName from patient_charges left join charges on patient_charges.charge_id = charges.id
      where patient_charges.transaction_id = ?
      `,
        [trnId],
      );
      const [getPlenomeTransacitonId] = await this.connection.query(
        `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
        [hospital_id, trnId],
      );
      let out: any = {
        status: 'success',
        messege: 'invoice details fetched successfully',
        patientDetails: patDetails,
        hospitalDetails: getHosDetails,
        paymentDetails: getPaymentDetails,
        plenome_transaction_id: getPlenomeTransacitonId.id,
        invoiceDetails: transactionDetails,
        total: getTranPat_id.amount,
      };
      const [tempApptPaymentDetails] = await this.dynamicConnection
        .query(`select temp_appt_amount,
        temp_appt_payment_id,
        temp_appt_payment_gateway from transactions where id = ${trnId} `);

      if (
        tempApptPaymentDetails?.temp_appt_payment_gateway
          ?.trim()
          .toLocaleLowerCase() == 'razorpay'
      ) {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const paymentDetails = await razorpay.payments.fetch(
          tempApptPaymentDetails.temp_appt_payment_id,
        );

        const tempPayDetails = {
          payment_method: 'Online',
          payment_gateway: tempApptPaymentDetails.temp_appt_payment_gateway,
          payment_details: paymentDetails,
        };
        out.tempPayDetails = tempPayDetails;
      }
      return out;
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findonePatCharge(hospital_id: number, pat_charge_id: any) {
    try {
      let query = ` select patient_charges.id patientCharge_id,
patient_charges.standard_charge,
patient_charges.tax,
case when patient_charges.payment_status = 'partially_paid' then 
                    format((((patient_charges.temp_standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.temp_tax)/100 ),2) else

            format((((patient_charges.standard_charge + patient_charges.additional_charge - patient_charges.discount_amount) * patient_charges.tax)/100 ),2) end taxAmount,
            patient_charges.discount_amount,
patient_charges.discount_percentage,
patient_charges.additional_charge,
patient_charges.additional_charge_note,
patient_charges.qty,
charges.name chargeName,
charges.id chargeId,
charge_categories.name chargeCategoryName,
charge_categories.id chargeCategoryId,
charge_type_master.charge_type chargeTypeName,
charge_type_master.id chargeTypeId
from patient_charges
left join charges on patient_charges.charge_id = charges.id
left join charge_categories on charge_categories.id = charges.charge_category_id
left join charge_type_master on charge_type_master.id = charge_categories.charge_type_id where patient_charges.id = ?
     `;
      let values = [pat_charge_id];

      const [getTransactionDetails] = await this.dynamicConnection.query(
        query,
        values,
      );

      return {
        status: 'success',
        messege: 'Details fetched successfully',
        details: getTransactionDetails,
      };
    } catch (error) {
      return error;
    }
  }

  async findOne(patient_id: number, hospital_id: number, filter?: string) {
    try {
      const patDetails = await this.dynamicConnection.query(
        `select patients.patient_name,patients.age,patients.gender,patients.mobileno,
        patients.email,
       patients.id ,    concat("PT",patients.id) plenome_patient_id
from patients where id = ?`,
        [patient_id],
      );

      let pendingQuery = ` SELECT 
    patient_charges.id AS patient_charge_id,
    DATE_FORMAT(patient_charges.date, '%D %b %Y') AS date,
    CASE
        WHEN patient_charges.opd_id = visit_details.opd_details_id 
             AND visit_details.id = appointment.visit_details_id THEN appointment.module
        WHEN patient_charges.opd_id = visit_details.opd_details_id 
             AND visit_details.id <> appointment.visit_details_id THEN appointment.module
        WHEN patient_charges.ipd_id THEN 'IPD'
        ELSE 'Additional charges'
    END AS section,
    appointment.appointment_status_id,
    CASE
        WHEN appointment.module = 'appointment' THEN CONCAT('APPN', appointment.id)
        WHEN appointment.module = 'opd' THEN CONCAT('OPDN', opd_details.id)
        WHEN patient_charges.ipd_id THEN CONCAT('IPDN', ipd_details.id)
        ELSE ' - '
    END AS section_id,
    CASE
        WHEN patient_charges.charge_id THEN 
            CONCAT(charges.name, ' - ', charge_categories.name)
        ELSE 'Hospital charge'
    END AS chargeDescription,
    patient_charges.qty,
    CASE 
        WHEN patient_charges.charge_id THEN charges.standard_charge
        ELSE patient_charges.temp_apply_charge
    END AS charges,
    CASE 
        WHEN patient_charges.charge_id THEN tax_category.percentage
        ELSE patient_charges.temp_tax
    END AS taxPercentage,
    patient_charges.discount_amount,
    patient_charges.discount_percentage,
    patient_charges.total,
    patient_charges.additional_charge
FROM 
    patient_charges
LEFT JOIN charges ON charges.id = patient_charges.charge_id
LEFT JOIN charge_categories ON charge_categories.id = charges.charge_category_id
LEFT JOIN tax_category ON tax_category.id = charges.tax_category_id
LEFT JOIN opd_details ON opd_details.id = patient_charges.opd_id
LEFT JOIN ipd_details ON ipd_details.id = patient_charges.ipd_id
LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
LEFT JOIN appointment ON appointment.visit_details_id = visit_details.id
WHERE 
    patient_charges.payment_status = 'unpaid' 
    AND patient_charges.patient_id = ?
    AND (
        (patient_charges.opd_id = visit_details.opd_details_id 
         AND visit_details.id = appointment.visit_details_id 
         AND appointment.appointment_status_id <> 4 and appointment.doctor)
        OR (patient_charges.opd_id IS NULL OR visit_details.id <> appointment.visit_details_id)
        OR (patient_charges.ipd_id IS NOT NULL)
        OR (patient_charges.opd_id IS NULL AND patient_charges.ipd_id IS NULL)
    ) 
    AND DATE(patient_charges.date) <= DATE(NOW()) `;
      let values: any = [patient_id];
      if (filter) {
        filter = filter.toLocaleLowerCase();
        switch (filter) {
          case 'opd':
            pendingQuery += ` AND lower((
        CASE
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id = appointment.visit_details_id THEN 'APPOINTMENT'
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id <> appointment.visit_details_id THEN 'OPD'
            WHEN patient_charges.ipd_id THEN 'IPD'
            ELSE 'Additional charges'
        END
    )) = 'opd' `;
            break;
          case 'ipd':
            pendingQuery += ` AND lower((
        CASE
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id = appointment.visit_details_id THEN 'APPOINTMENT'
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id <> appointment.visit_details_id THEN 'OPD'
            WHEN patient_charges.ipd_id THEN 'IPD'
            ELSE 'Additional charges'
        END
    )) = 'ipd' `;
            break;
          case 'appointment':
            pendingQuery += ` AND lower((
        CASE
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id = appointment.visit_details_id THEN 'APPOINTMENT'
            WHEN patient_charges.opd_id = visit_details.opd_details_id 
                 AND visit_details.id <> appointment.visit_details_id THEN 'OPD'
            WHEN patient_charges.ipd_id THEN 'IPD'
            ELSE 'Additional charges'
        END
    )) = 'appointment' `;
            break;
        }
      }
      const getPendingPaymentList = await this.dynamicConnection.query(
        pendingQuery + ` ORDER BY patient_charges.date DESC `,
        values,
      );

      const overallTotal = getPendingPaymentList.reduce(
        (sum, current) => sum + current.total,
        0,
      );

      let out = {
        patientDetails: patDetails,
        pendingDetails: getPendingPaymentList,
        totalDue: overallTotal,
      };

      return out;
    } catch (error) {
      return error;
    }
  }

  async findpending(hospital_id: number) {
    try {
      const getPendingPaymentList = await this.dynamicConnection.query(`SELECT 
    p.patient_name,
    p.id AS patientID,
    p.mobileno,
    p.email,
    COALESCE(SUM(
        CASE 
            WHEN pc.payment_status = 'unpaid' THEN 
             -- round( ( COALESCE(pc.amount, 0) - COALESCE(pc.temp_amount, 0) + COALESCE(pc.additional_charge, 0) - COALESCE(pc.discount_amount, 0)), 2)
            COALESCE(pc.total, 0)
             ELSE 0
        END
    ), 0.00) AS balanceAmount
FROM patients p
LEFT JOIN patient_charges pc ON p.id = pc.patient_id
LEFT JOIN opd_details od ON od.id = pc.opd_id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN appointment a ON a.visit_details_id = vd.id
WHERE a.appointment_status_id <> 4 
  AND a.doctor IS NOT NULL
  AND DATE(pc.date) <= DATE(NOW())
GROUP BY 
    p.id
HAVING balanceAmount <> 0;

     
        `);

      const overallTotal = getPendingPaymentList.reduce(
        (sum, current) => sum + current.balanceAmount,
        0,
      );
      const roundedTotal = parseFloat(overallTotal.toFixed(3));

      return {
        status: 'success',
        message: 'Details Fetched Successfully',
        PendingList: getPendingPaymentList,
        Count: getPendingPaymentList.length,
        total: roundedTotal,
      };
    } catch (error) {
      return error;
    }
  }
  async findChargeType(hospital_id: number) {
    try {
      const out = await this.dynamicConnection.query(
        ` select * from charge_type_master `,
      );

      return out;
    } catch (error) {
      return error;
    }
  }

  async findChargeCategory(hospital_id: number, charge_type_id: any) {
    try {
      const out = await this.dynamicConnection.query(
        ` select * from charge_categories where charge_type_id = ? `,
        [charge_type_id],
      );

      return out;
    } catch (error) {
      return error;
    }
  }

  async findChargeName(hospital_id: number, charge_category_id: any) {
    try {
      let out;
      if (charge_category_id) {
        out = await this.dynamicConnection.query(
          ` select charges.*,concat(tax_category.percentage) taxPercentage, 
    round(((charges.standard_charge * tax_category.percentage) /100),2) taxAmount,
     round((charges.standard_charge+
           (charges.standard_charge*((tax_category.percentage)/100))),2) totalAmount
    from charges
    left join tax_category on tax_category.id = charges.tax_category_id
     where charge_category_id =  ? `,
          [charge_category_id],
        );
      } else {
        out = await this.dynamicConnection
          .query(`select charges.*,concat(tax_category.percentage) taxPercentage, 
    round(((charges.standard_charge * tax_category.percentage) /100),2) taxAmount,
     round((charges.standard_charge+
           (charges.standard_charge*((tax_category.percentage)/100))),2) totalAmount
    from charges
    left join tax_category on tax_category.id = charges.tax_category_id`);
      }

      return out;
    } catch (error) {
      return error;
    }
  }

  async findChargeDetails(id: any, hospital_id: number) {
    try {
      const out = await this.dynamicConnection.query(
        ` select charges.id,charges.name,
        charge_categories.name chargeCategoryName,
charge_categories.id chargeCategoryId,
charge_type_master.charge_type chargeTypeName,
charge_type_master.id chargeTypeId,
                      charges.standard_charge,tax_category.percentage taxPercentage,
                      ((tax_category.percentage/100)*charges.standard_charge) taxAmount,
                      (charges.standard_charge + ((tax_category.percentage/100)*charges.standard_charge)) totalAmount
                       from charges 
left join charge_categories on charge_categories.id = charges.charge_category_id
left join charge_type_master on charge_type_master.id = charge_categories.charge_type_id
                       left join tax_category on tax_category.id = charges.tax_category_id
                       where charges.id = ? `,
        [id],
      );

      return out;
    } catch (error) {
      return error;
    }
  }

  async makePayment(Entity: makepayment) {
    let getVal = await this.findOne(Entity.patient_id, Entity.Hospital_id);
    const ids = getVal.pendingDetails.map((item) => item.patient_charge_id);
    let amount = getVal.totalDue;

    try {
      if (!Entity.txn_id) {
        Entity.txn_id = 'NA';
      }
      if (!Entity.bank_ref_id) {
        Entity.bank_ref_id = 'NA';
      }
      if (!Entity.pg_ref_id) {
        Entity.pg_ref_id = 'NA';
      }

      const insertTransaction = await this.dynamicConnection.query(
        `insert into transactions (
        txn_id,
        pg_ref_id,
        bank_ref_id,
        type,
        patient_id,
        amount,
        payment_mode,
        section,
        payment_date,
        received_by_name
        ) values (?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          Entity.patient_id,
          amount,
          Entity.payment_mode,
          'Payment',
          Entity.payment_date,
          Entity.received_by_name,
        ],
      );
      const [getPatMobileno] = await this.dynamicConnection.query(
        `select aayush_unique_id from patients where id = ?`,
        [Entity.patient_id],
      );

      const [getAdminPatientId] = await this.connection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getPatMobileno.aayush_unique_id],
      );

      const AdmininsertTransaction = await this.connection.query(
        `insert into transactions (
      txn_id,
      pg_ref_id,
      bank_ref_id,
      type,
      patient_id,
      amount,
      payment_mode,
      Hospital_id,
      hos_transaction_id,
      section,
      payment_date,
      received_by_name
        ) values (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          getAdminPatientId.id,
          amount,
          Entity.payment_mode,
          Entity.Hospital_id,
          insertTransaction.insertId,
          'Payment',
          Entity.payment_date,
          Entity.received_by_name,
        ],
      );
      for (const id of ids) {
        try {
          let [getAdminChargeId] = await this.connection.query(
            `select id from patient_charges where Hospital_id = ? and hos_patient_charges_id = ?`,
            [Entity.Hospital_id, id],
          );

          await this.dynamicConnection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', insertTransaction.insertId, id],
          );

          this.connection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', AdmininsertTransaction.insertId, getAdminChargeId.id],
          );
        } catch (error) {
          console.log(error, 'error');
        }
      }

      return {
        status: 'success',
        message: 'payment done successfully',
        transactionId: 'TRID' + insertTransaction.insertId,
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async update(id: number, Entity: UpdateCharge) {
    try {
      await this.dynamicConnection.query(
        ` update patient_charges set 
      qty = ?,
      charge_id = ?,
      standard_charge = ?,
      tax = ?,
      apply_charge = ?,
      amount = ?,
      additional_charge = ?,
      additional_charge_note = ?,
      discount_percentage = ?,
      discount_amount = ?,
      total = ? where id = ? `,
        [
          Entity.qty,
          Entity.charge_id,
          Entity.standard_charge,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.total,
          id,
        ],
      );

      const [getAdminCharge_id] = await this.connection.query(
        `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
        [Entity.Hospital_id, Entity.charge_id],
      );

      const [GetAdminPatChargeId] = await this.connection.query(
        `select id from patient_charges where Hospital_id = ? and hos_patient_charges_id = ?`,
        [Entity.Hospital_id, id],
      );

      await this.connection.query(
        ` update patient_charges set 
      qty = ?,
      charge_id = ?,
      standard_charge = ?,
      tax = ?,
      apply_charge = ?,
      amount = ?,
      additional_charge = ?,
      additional_charge_note = ?,
      discount_percentage = ?,
      discount_amount = ?,
      total = ? where id = ? `,
        [
          Entity.qty,
          getAdminCharge_id.id,
          Entity.standard_charge,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.total,
          GetAdminPatChargeId.id,
        ],
      );

      return {
        status: 'success',
        message: 'charges updated successfully.',
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findpendingV2(
    limit: number,
    page: number,
  ): Promise<PatientBalanceDtoWithCount> {
    const offset = limit * (page - 1);

    try {
      const getPendingPaymentList = await this.dynamicConnection.query(`SELECT 
    p.patient_name,
    p.id AS patientID,
      concat("PT",p.id) plenome_patient_id,
    p.mobileno,
    p.email,
    COALESCE(SUM(
        CASE 
            WHEN pc.payment_status = 'unpaid' THEN 
             -- round( ( COALESCE(pc.amount, 0) - COALESCE(pc.temp_amount, 0) + COALESCE(pc.additional_charge, 0) - COALESCE(pc.discount_amount, 0)), 2)
            COALESCE(pc.total, 0)
             ELSE 0
        END
    ), 0.00) AS balanceAmount
FROM patients p
LEFT JOIN patient_charges pc ON p.id = pc.patient_id
LEFT JOIN opd_details od ON od.id = pc.opd_id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN appointment a ON a.visit_details_id = vd.id
WHERE a.appointment_status_id <> 4 
  AND a.doctor IS NOT NULL
  AND DATE(pc.date) <= DATE(NOW())
GROUP BY 
    p.id
HAVING balanceAmount <> 0
    order by pc.date desc
 limit ${limit} offset ${offset};     
        `);
      const [totalCount] = await this.dynamicConnection
        .query(`SELECT COUNT(DISTINCT p.id) AS totalCount
FROM patients p
LEFT JOIN patient_charges pc ON p.id = pc.patient_id
LEFT JOIN opd_details od ON od.id = pc.opd_id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN appointment a ON a.visit_details_id = vd.id
WHERE a.appointment_status_id <> 4
  AND a.doctor IS NOT NULL
  AND DATE(pc.date) <= DATE(NOW())
  AND pc.payment_status = 'unpaid'
  AND COALESCE(pc.total, 0) <> 0
`);
      const overallTotal = getPendingPaymentList.reduce(
        (sum, current) => sum + current.balanceAmount,
        0,
      );
      const roundedTotal = parseFloat(overallTotal.toFixed(3));
      return {
        PendingList: getPendingPaymentList,
        Count: totalCount.totalCount,
        total: roundedTotal,
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findAllV2(
    from_date: any,
    to_date: any,
    patient_id: any,
    payment_method: any,
    date: any,
    limit: number,
    page: number,
  ): Promise<PatientTransactionDtoWithCount> {
    const offset = limit * (page - 1);

    try {
      let query = `   select patients.id patientId,
        concat("PT",patients.id) plenome_patient_id,
        patients.patient_name,
     concat("TRID",transactions.id) transaction_id,
     date(transactions.payment_date) payment_date,
     transactions.payment_mode,
     transactions.payment_method,
        transactions.card_division,
        transactions.card_type,
        transactions.card_transaction_id,
        transactions.card_bank_name,
        transactions.net_banking_division,
        transactions.net_banking_transaction_id,
        transactions.upi_id,
        transactions.upi_bank_name,
        transactions.upi_transaction_id,
                    concat(COALESCE(transactions.net_banking_transaction_id,""),COALESCE(transactions.card_transaction_id,""),COALESCE(transactions.upi_transaction_id,""),
            COALESCE(transactions.payment_reference_number,""),
            COALESCE(transactions.cash_transaction_id,"")) payment_transaction_id,
      CASE
         WHEN transactions.amount is not null THEN transactions.amount
         ELSE transactions.temp_appt_amount
     END AS amount
     from transactions
     left join patients on patients.id = transactions.patient_id
     left join patient_charges on patient_charges.id = transactions.patient_charges_id
     where transactions.id 
     `;
      let countQuery = ` select count(id) as totalCount from transactions where transactions.id `;
      let countValues = [];
      let values = [];

      if (from_date || to_date) {
        if (from_date) {
          query += ` and  transactions.payment_date >= ? `;
          values.push(from_date);

          countQuery += ` and  transactions.payment_date >= ? `;
          countValues.push(from_date);
        }
        if (to_date) {
          query += ` and  transactions.payment_date <= ? `;
          values.push(to_date);
          countQuery += ` and  transactions.payment_date <= ? `;
          countValues.push(to_date);
        }
      } else if (date) {
        query += ` and date(transactions.payment_date) = date(?) `;
        values.push(date);

        countQuery += ` and date(transactions.payment_date) = date(?) `;
        countValues.push(date);
      }

      if (patient_id) {
        query += ` and  transactions.patient_id = ? `;
        values.push(patient_id);

        countQuery += ` and  transactions.patient_id = ? `;
        countValues.push(patient_id);
      }
      if (payment_method) {
        query += ` and  transactions.payment_mode = ? `;
        values.push(payment_method);

        countQuery += ` and  transactions.payment_mode = ? `;
        countValues.push(payment_method);
      }

      let limitQuery = `order by transactions.created_at desc limit ${limit} offset ${offset}`;
      const getTransactionDetails = await this.dynamicConnection.query(
        query + limitQuery,
        values,
      );
      const [getCount] = await this.dynamicConnection.query(
        countQuery,
        countValues,
      );
      getTransactionDetails.forEach(async (transaction) => {
        let date = transaction.payment_date;
        let formattedDate;
        if (transaction.payment_date) {
          formattedDate = date.toISOString().split('T')[0];
        } else {
          formattedDate = transaction.payment_date;
        }

        transaction.payment_date = await formattedDate;
      });
      const overallTotal = getTransactionDetails.reduce(
        (sum, current) => sum + current.amount,
        0,
      );

      return {
        details: getTransactionDetails,
        Totalcount: getCount.totalCount,
        TotalAmount: parseFloat(overallTotal.toFixed(3)),
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async getpendingApptofPat(patient_id: number) {
    try {
      const getPendingPaymentList = await this.dynamicConnection.query(
        `SELECT distinct

    CASE 
        WHEN appointment.module = 'APPOINTMENT' THEN CONCAT('APPN', appointment.id)
        WHEN appointment.module = 'OPD' THEN CONCAT('OPDN', visit_details.opd_details_id)
    END AS pendingId
FROM appointment
LEFT JOIN visit_details ON visit_details.id = appointment.visit_details_id 
left join patient_charges on patient_charges.opd_id = visit_details.opd_details_id
WHERE appointment.patient_id = ? 
  AND appointment.appointment_status_id = 5 and appointment.module <> 'IPD' and date(appointment.date) <= date(now())
 -- and patient_charges.payment_status = 'unpaid'
 order by patient_charges.date desc
`,
        [patient_id],
      );

      const [ipdPending] = await this.dynamicConnection.query(
        `select concat("IPDN",ipd_details.id) as pendingId 
  from ipd_details where ipd_details.patient_id = ? and ipd_details.discharged = 'no'`,
        [patient_id],
      );

      if (ipdPending) getPendingPaymentList.push(ipdPending);

      return getPendingPaymentList;
    } catch (error) {
      return error;
    }
  }

  async makePaymentV2(Entity: makepayment) {
    let getVal = Entity.paymentDetails;

    const ids = getVal.map((item) => item.patient_charge_id);
    console.log(ids, 'ids');

    let amount = Entity.totalDue;
    console.log(amount, 'amount');

    const firstSectionId = getVal[0]?.section_id;
    const allSameSectionId = getVal.every(
      (charge) => charge.section_id === firstSectionId,
    );
    const letters = firstSectionId.match(/[A-Za-z]+/)?.[0] ?? '';
    const numbers = firstSectionId.match(/\d+/)?.[0] ?? '';

    if (!allSameSectionId) {
      return {
        status_code: '400',
        status: 'Failed',
        message: 'All section_id values must be the same.',
      };
    }
    let sectionIdName;
    let idkey;
    let adminKey;
    switch (letters) {
      case 'APPN':
        sectionIdName = 'Appointment';
        idkey = 'appointment_id';
        const [getAdminAppId] = await this.connection.query(
          `select id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        adminKey = getAdminAppId.id;
        break;
      case 'OPDN':
        sectionIdName = 'OPD';
        idkey = 'opd_id';
        const [getAdminOpdId] = await this.connection.query(
          `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        adminKey = getAdminOpdId.id;
        break;
      case 'IPDN':
        sectionIdName = 'IPD';
        idkey = 'ipd_id';
        const [getAdminIpdId] = await this.connection.query(
          `select id from ipd_details where hospital_id = ? and hospital_ipd_details_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        adminKey = getAdminIpdId.id;
        break;
    }

    try {
      if (!Entity.txn_id) {
        Entity.txn_id = 'NA';
      }
      if (!Entity.bank_ref_id) {
        Entity.bank_ref_id = 'NA';
      }
      if (!Entity.pg_ref_id) {
        Entity.pg_ref_id = 'NA';
      }

      const insertTransaction = await this.dynamicConnection.query(
        `insert into transactions (
        txn_id,
        pg_ref_id,
        bank_ref_id,
        type,
        patient_id,
        amount,
        payment_mode,
        section,
        payment_date,
        received_by_name,
        ${idkey}
        ) values (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          Entity.patient_id,
          amount,
          Entity.payment_mode,
          sectionIdName,
          Entity.payment_date,
          Entity.received_by_name,
          numbers,
        ],
      );
      const [getPatMobileno] = await this.dynamicConnection.query(
        `select aayush_unique_id from patients where id = ?`,
        [Entity.patient_id],
      );

      const [getAdminPatientId] = await this.connection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getPatMobileno.aayush_unique_id],
      );

      const AdmininsertTransaction = await this.connection.query(
        `insert into transactions (
      txn_id,
      pg_ref_id,
      bank_ref_id,
      type,
      patient_id,
      amount,
      payment_mode,
      Hospital_id,
      hos_transaction_id,
      section,
      payment_date,
      received_by_name,
      ${idkey}
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          getAdminPatientId.id,
          amount,
          Entity.payment_mode,
          Entity.Hospital_id,
          insertTransaction.insertId,
          sectionIdName,
          Entity.payment_date,
          Entity.received_by_name,
          adminKey,
        ],
      );
      for (const id of ids) {
        try {
          let [getAdminChargeId] = await this.connection.query(
            `select id from patient_charges where Hospital_id = ? and hos_patient_charges_id = ?`,
            [Entity.Hospital_id, id],
          );

          await this.dynamicConnection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', insertTransaction.insertId, id],
          );

          this.connection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', AdmininsertTransaction.insertId, getAdminChargeId.id],
          );
        } catch (error) {
          console.log(error, 'error');
        }
      }

      return {
        status: 'success',
        message: 'payment done successfully',
        transactionId: 'TRID' + insertTransaction.insertId,
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async createV2(Entity: AddCharge) {
    const letters = Entity.sectionID.match(/[A-Za-z]+/)?.[0] ?? '';
    let numbers = Entity.sectionID.match(/\d+/)?.[0] ?? '';
    let sectionIdName;
    let adminID;
    if (letters.toLocaleLowerCase() == 'appn') {
      sectionIdName = ',opd_id';
      const [getOpdIdOfAppt] = await this.dynamicConnection.query(
        `select opd_details_id from visit_details
  left join appointment on appointment.visit_details_id = visit_details.id
  where appointment.id = ?`,
        [numbers],
      );
      numbers = getOpdIdOfAppt.opd_details_id;
      const [getAdminOpdId] = await this.connection.query(
        `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
        [Entity.Hospital_id, numbers],
      );
      adminID = getAdminOpdId.id;
    } else if (letters.toLocaleLowerCase() == 'opdn') {
      const [getAdminOpdId] = await this.connection.query(
        `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
        [Entity.Hospital_id, numbers],
      );
      adminID = getAdminOpdId.id;
      sectionIdName = ',opd_id';
    } else if (letters.toLocaleLowerCase() == 'ipdn') {
      const [getAdminIpdId] = await this.connection.query(
        `select id from ipd_details where hospital_id = ? and hospital_ipd_details_id = ?`,
        [Entity.Hospital_id, numbers],
      );
      adminID = getAdminIpdId.id;
      sectionIdName = ',ipd_id';
    } else {
      sectionIdName = '';
    }
    let idValue = `,${numbers}`;
    let adminIdValue = `,${adminID}`;
    try {
      const insertIntoPatientCharges = await this.dynamicConnection.query(
        ` insert into patient_charges(
      date,
      qty,
      charge_id,
      standard_charge,
      tpa_charge,
      tax,
      apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total,
    discount_percentage,
    discount_amount,
    additional_charge,
    additional_charge_note ${sectionIdName}
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ${idValue}) `,
        [
          Entity.date,
          Entity.qty,
          Entity.charge_id,
          Entity.standard_charge,
          0.0,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.note,
          'unpaid',
          Entity.patient_id,
          Entity.total,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
        ],
      );

      const [getAdminCharge_id] = await this.connection.query(
        `select id from charges where Hospital_id = ? and hospital_charges_id = ?`,
        [Entity.Hospital_id, Entity.charge_id],
      );

      const [getHosPatientMob] = await this.dynamicConnection.query(
        `select mobileno from patients where id = ? `,
        [Entity.patient_id],
      );

      const [getAdminPatid] = await this.connection.query(
        `select id from patients where mobileno = ?`,
        [getHosPatientMob.mobileno],
      );

      await this.connection.query(
        ` insert into patient_charges(
      date,
      qty,
      charge_id,
      standard_charge,
      tpa_charge,
      tax,
      apply_charge,
    amount,
    note,
    payment_status,
    patient_id,
    total,
    Hospital_id,
    hos_patient_charges_id,
    discount_percentage,
    discount_amount,
    additional_charge,
    additional_charge_note ${sectionIdName}
    ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ${adminIdValue}) `,
        [
          Entity.date,
          Entity.qty,
          getAdminCharge_id.id,
          Entity.standard_charge,
          0.0,
          Entity.tax,
          Entity.standard_charge,
          Entity.amount,
          Entity.note,
          'unpaid',
          getAdminPatid.id,
          Entity.amount,
          Entity.Hospital_id,
          insertIntoPatientCharges.insertId,
          Entity.discount_percentage,
          Entity.discount_amount,
          Entity.additional_charge,
          Entity.additional_charge_note,
        ],
      );

      return {
        status: 'success',
        message: 'charges added successfully.',
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findOnev2(patient_id: number, hospital_id: number, filter?: string) {
    try {
      const patDetails = await this.dynamicConnection.query(
        `select patients.patient_name,patients.age,patients.gender,patients.mobileno,
        patients.email,
       ,        concat("PT",patients.id) plenome_patient_id from patients where id = ?`,
        [patient_id],
      );

      let pendingQuery = ` SELECT 
    patient_charges.id AS patient_charge_id,
    DATE_FORMAT(patient_charges.date, '%D %b %Y') AS date,
    CASE
        WHEN patient_charges.opd_id = visit_details.opd_details_id 
             AND visit_details.id = appointment.visit_details_id THEN appointment.module
        WHEN patient_charges.opd_id = visit_details.opd_details_id 
             AND visit_details.id <> appointment.visit_details_id THEN appointment.module
        WHEN patient_charges.ipd_id THEN 'IPD'
        ELSE 'Additional charges'
    END AS section,
    appointment.appointment_status_id,
    CASE
        WHEN lower(appointment.module) = 'appointment' THEN CONCAT('APPN', appointment.id)
        WHEN lower(appointment.module) = 'opd' THEN CONCAT('OPDN', opd_details.id)
        WHEN patient_charges.ipd_id THEN CONCAT('IPDN', ipd_details.id)
        ELSE ' - '
    END AS section_id,
    CASE
        WHEN patient_charges.charge_id THEN 
            CONCAT(charges.name, ' - ', charge_categories.name)
        ELSE 'Hospital charge'
    END AS chargeDescription,
    patient_charges.qty,
    CASE 
        WHEN patient_charges.charge_id THEN charges.standard_charge
        ELSE patient_charges.temp_apply_charge
    END AS charges,
    CASE 
        WHEN patient_charges.charge_id THEN tax_category.percentage
        ELSE patient_charges.temp_tax
    END AS taxPercentage,
    patient_charges.discount_amount,
    patient_charges.discount_percentage,
    patient_charges.total,
    patient_charges.additional_charge
FROM 
    patient_charges
LEFT JOIN charges ON charges.id = patient_charges.charge_id
LEFT JOIN charge_categories ON charge_categories.id = charges.charge_category_id
LEFT JOIN tax_category ON tax_category.id = charges.tax_category_id
LEFT JOIN opd_details ON opd_details.id = patient_charges.opd_id
LEFT JOIN ipd_details ON ipd_details.id = patient_charges.ipd_id
LEFT JOIN visit_details ON visit_details.opd_details_id = opd_details.id
LEFT JOIN appointment ON appointment.visit_details_id = visit_details.id
WHERE 
    patient_charges.payment_status = 'unpaid' 
    AND patient_charges.patient_id = ?
    AND (
        (patient_charges.opd_id = visit_details.opd_details_id 
         AND visit_details.id = appointment.visit_details_id 
         AND appointment.appointment_status_id <> 4 and appointment.doctor)
        OR (patient_charges.opd_id IS NULL OR visit_details.id <> appointment.visit_details_id)
        OR (patient_charges.ipd_id IS NOT NULL)
        OR (patient_charges.opd_id IS NULL AND patient_charges.ipd_id IS NULL)
    ) 
    AND DATE(patient_charges.date) <= DATE(NOW()) `;
      let values: any = [patient_id];
      if (filter) {
        pendingQuery += `AND (
    CASE
        WHEN appointment.module = 'appointment' THEN CONCAT('APPN', appointment.id)
        WHEN appointment.module = 'opd' THEN CONCAT('OPDN', opd_details.id)
        WHEN patient_charges.ipd_id IS NOT NULL THEN CONCAT('IPDN', ipd_details.id)
        ELSE ' - '
    END
) = '${filter}'`;
      }
      const getPendingPaymentList = await this.dynamicConnection.query(
        pendingQuery + ` ORDER BY patient_charges.date DESC `,
        values,
      );

      const overallTotal = getPendingPaymentList.reduce(
        (sum, current) => sum + current.total,
        0,
      );

      let out = {
        patientDetails: patDetails,
        pendingDetails: getPendingPaymentList,
        totalDue: overallTotal,
      };

      return out;
    } catch (error) {
      return error;
    }
  }

  async findpendingV3(limit: number, page: number) {
    const offset = limit * (page - 1);

    try {
      const pat_charge_details = await this.dynamicConnection
        .query(`select patient_charges.opd_id, patient_charges.patient_id, COALESCE(SUM(
        CASE
            WHEN patient_charges.payment_status = 'unpaid' THEN
            COALESCE(patient_charges.total, 0)
             ELSE 0
        END
    ), 0.00) AS balanceAmount from patient_charges 
    LEFT JOIN opd_details od ON od.id = patient_charges.opd_id
    LEFT JOIN patients p ON p.id = patient_charges.patient_id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN appointment a ON a.visit_details_id = vd.id WHERE a.appointment_status_id <> 4 
  AND a.doctor IS NOT NULL
  AND DATE(patient_charges.date) <= DATE(NOW()) group by patient_id order by patient_charges.date desc limit ${limit} offset ${offset} having balanceAmount <> 0 `);
      if (pat_charge_details.length > 0) {
        const patientID = pat_charge_details.map((app) => app.patient_id);

        const [patients] = await Promise.all([
          this.dynamicConnection.query(
            `select patient_name, id, mobileno, email from patients where id in (?)`,
            [patientID],
          ),
        ]);

        const patient_mapping = new Map(patients.map((p) => [p.id, p]));
        await Promise.all(
          pat_charge_details.map(async (app) => {
            app.patientdetails = patient_mapping.get(app.patient_id);
          }),
        );
      }

      const overallTotal = pat_charge_details.reduce(
        (sum, current) => sum + current.balanceAmount,
        0,
      );
      const [totalCount] = await this.dynamicConnection
        .query(`SELECT COUNT(DISTINCT p.id) AS totalCount
FROM patients p
LEFT JOIN patient_charges pc ON p.id = pc.patient_id
LEFT JOIN opd_details od ON od.id = pc.opd_id
LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
LEFT JOIN appointment a ON a.visit_details_id = vd.id
WHERE a.appointment_status_id <> 4
  AND a.doctor IS NOT NULL
  AND DATE(pc.date) <= DATE(NOW())
  AND pc.payment_status = 'unpaid'
  AND COALESCE(pc.total, 0) <> 0
`);
      const roundedTotal = parseFloat(overallTotal.toFixed(3));
      console.log(roundedTotal, 'roundedTotal', totalCount);

      let out = {
        PendingList: pat_charge_details,
        Count: totalCount.totalCount,
        total: roundedTotal,
      };

      return out;
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async findAllV3(
    from_date: any,
    to_date: any,
    patient_id: any,
    payment_method: any,
    date: any,
    limit: number,
    page: number,
  ): Promise<PatientTransactionDtoWithCount> {
    const offset = limit * (page - 1);

    try {
      let query = `   select patients.id patientId,patients.patient_name,
     concat("TRID",transactions.id) transaction_id,
     date(transactions.payment_date) payment_date,
     transactions.payment_mode,
     transactions.payment_method,
        transactions.card_division,
        transactions.card_type,
        transactions.card_transaction_id,
        transactions.card_bank_name,
        transactions.net_banking_division,
        transactions.net_banking_transaction_id,
        transactions.upi_id,
        transactions.upi_bank_name,
        transactions.upi_transaction_id,
                        concat(COALESCE(transactions.net_banking_transaction_id,""),COALESCE(transactions.card_transaction_id,""),COALESCE(transactions.upi_transaction_id,""),
            COALESCE(transactions.payment_reference_number,""),
            COALESCE(transactions.cash_transaction_id,"")) payment_transaction_id,
      CASE
         WHEN transactions.amount is not null THEN transactions.amount
         ELSE transactions.temp_appt_amount
     END AS amount
     from transactions
     left join patients on patients.id = transactions.patient_id
     left join patient_charges on patient_charges.id = transactions.patient_charges_id
     where transactions.id 
     `;
      let countQuery = ` select count(id) as totalCount from transactions where transactions.id `;
      let countValues = [];
      let values = [];

      if (from_date || to_date) {
        if (from_date) {
          query += ` and  transactions.payment_date >= ? `;
          values.push(from_date);

          countQuery += ` and  transactions.payment_date >= ? `;
          countValues.push(from_date);
        }
        if (to_date) {
          query += ` and  transactions.payment_date <= ? `;
          values.push(to_date);
          countQuery += ` and  transactions.payment_date <= ? `;
          countValues.push(to_date);
        }
      } else if (date) {
        query += ` and date(transactions.payment_date) = date(?) `;
        values.push(date);

        countQuery += ` and date(transactions.payment_date) = date(?) `;
        countValues.push(date);
      }

      if (patient_id) {
        query += ` and  transactions.patient_id = ? `;
        values.push(patient_id);

        countQuery += ` and  transactions.patient_id = ? `;
        countValues.push(patient_id);
      }
      if (payment_method) {
        query += ` and  transactions.payment_mode = ? `;
        values.push(payment_method);

        countQuery += ` and  transactions.payment_mode = ? `;
        countValues.push(payment_method);
      }

      let limitQuery = `order by transactions.payment_date desc limit ${limit} offset ${offset}`;
      const getTransactionDetails = await this.dynamicConnection.query(
        query + limitQuery,
        values,
      );
      const [getCount] = await this.dynamicConnection.query(
        countQuery,
        countValues,
      );
      getTransactionDetails.forEach(async (transaction) => {
        let date = transaction.payment_date;
        let formattedDate;
        if (transaction.payment_date) {
          formattedDate = date.toISOString().split('T')[0];
        } else {
          formattedDate = transaction.payment_date;
        }

        transaction.payment_date = await formattedDate;
      });
      const overallTotal = getTransactionDetails.reduce(
        (sum, current) => sum + current.amount,
        0,
      );

      return {
        details: getTransactionDetails,
        Totalcount: getCount.totalCount,
        TotalAmount: parseFloat(overallTotal.toFixed(3)),
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }

  async makePaymentV3(Entity: makepaymentV3) {
    let getVal = Entity.paymentDetails;

    const ids = getVal.map((item) => item.patient_charge_id);
    console.log(ids, 'ids');

    let amount = Entity.totalDue;
    console.log(amount, 'amount');

    const firstSectionId = getVal[0]?.section_id;
    const allSameSectionId = getVal.every(
      (charge) => charge.section_id === firstSectionId,
    );
    const letters = firstSectionId.match(/[A-Za-z]+/)?.[0] ?? '';
    const numbers = firstSectionId.match(/\d+/)?.[0] ?? '';

    if (!allSameSectionId) {
      return {
        status_code: '400',
        status: 'Failed',
        message: 'All section_id values must be the same.',
      };
    }
    let sectionIdName;
    let idkey;
    let adminKey;
    switch (letters) {
      case 'APPN':
        sectionIdName = 'Appointment';
        idkey = 'appointment_id';
        const [getAdminAppId] = await this.connection.query(
          `select id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        console.log(getAdminAppId, 'getAdminAppId');

        adminKey = getAdminAppId.id;
        break;
      case 'OPDN':
        sectionIdName = 'OPD';
        idkey = 'opd_id';
        const [getAdminOpdId] = await this.connection.query(
          `select id from opd_details where Hospital_id = ? and hos_opd_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        adminKey = getAdminOpdId.id;
        break;
      case 'IPDN':
        sectionIdName = 'IPD';
        idkey = 'ipd_id';
        const [getAdminIpdId] = await this.connection.query(
          `select id from ipd_details where hospital_id = ? and hospital_ipd_details_id = ?`,
          [Entity.Hospital_id, numbers],
        );
        adminKey = getAdminIpdId.id;
        break;
    }

    try {
      if (!Entity.txn_id) {
        Entity.txn_id = 'NA';
      }
      if (!Entity.bank_ref_id) {
        Entity.bank_ref_id = 'NA';
      }
      if (!Entity.pg_ref_id) {
        Entity.pg_ref_id = 'NA';
      }
      try {
        console.log('ccccc');

        await this.dynamicConnection.query(
          `ALTER TABLE \`transactions\` 
  ADD COLUMN \`payment_method\`            VARCHAR(45)  NULL AFTER \`received_by_name\`,
  ADD COLUMN \`card_division\`             VARCHAR(255) NULL AFTER \`payment_method\`,
  ADD COLUMN \`card_type\`                 VARCHAR(255) NULL AFTER \`card_division\`,
  ADD COLUMN \`card_transaction_id\`       VARCHAR(255) NULL AFTER \`card_type\`,
  ADD COLUMN \`card_bank_name\`            VARCHAR(255) NULL AFTER \`card_transaction_id\`,
  ADD COLUMN \`net_banking_division\`      VARCHAR(255) NULL AFTER \`card_bank_name\`,
  ADD COLUMN \`net_banking_transaction_id\` VARCHAR(255) NULL AFTER \`net_banking_division\`,
  ADD COLUMN \`upi_id\`                    VARCHAR(255) NULL AFTER \`net_banking_transaction_id\`,
  ADD COLUMN \`upi_bank_name\`             VARCHAR(255) NULL AFTER \`upi_id\`,
  ADD COLUMN \`upi_transaction_id\`        VARCHAR(255) NULL AFTER \`upi_bank_name\`,
    ADD COLUMN \`cash_transaction_id\`     VARCHAR(255) NULL AFTER \`upi_transaction_id\`,
;`,
        );
        console.log('ggggg');
      } catch (error) {
        console.log('error in adding new columns to transactions table');
      }

      try {
        console.log('oiuytre');

        await this.connection.query(
          `ALTER TABLE \`transactions\` 
  ADD COLUMN \`payment_method\`            VARCHAR(45)  NULL AFTER \`received_by_name\`,
  ADD COLUMN \`card_division\`             VARCHAR(255) NULL AFTER \`payment_method\`,
  ADD COLUMN \`card_type\`                 VARCHAR(255) NULL AFTER \`card_division\`,
  ADD COLUMN \`card_transaction_id\`       VARCHAR(255) NULL AFTER \`card_type\`,
  ADD COLUMN \`card_bank_name\`            VARCHAR(255) NULL AFTER \`card_transaction_id\`,
  ADD COLUMN \`net_banking_division\`      VARCHAR(255) NULL AFTER \`card_bank_name\`,
  ADD COLUMN \`net_banking_transaction_id\` VARCHAR(255) NULL AFTER \`net_banking_division\`,
  ADD COLUMN \`upi_id\`                    VARCHAR(255) NULL AFTER \`net_banking_transaction_id\`,
  ADD COLUMN \`upi_bank_name\`             VARCHAR(255) NULL AFTER \`upi_id\`,
  ADD COLUMN \`upi_transaction_id\`        VARCHAR(255) NULL AFTER \`upi_bank_name\`,
    ADD COLUMN \`cash_transaction_id\`     VARCHAR(255) NULL AFTER \`upi_transaction_id\`,
;`,
        );
        console.log('lkjhgfds');
      } catch (error) {
        console.log('error in adding new columns to transactions table');
      }
      const insertTransaction = await this.dynamicConnection.query(
        `insert into transactions (
        txn_id,
        pg_ref_id,
        bank_ref_id,
        type,
        patient_id,
        amount,
        payment_mode,
        section,
        payment_date,
        received_by_name,
        payment_method,
        card_division,
        card_type,
        card_transaction_id,
        card_bank_name,
        net_banking_division,
        net_banking_transaction_id,
        upi_id,
        upi_bank_name,
        upi_transaction_id,
        ${idkey}
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          Entity.patient_id,
          amount,
          Entity.payment_mode,
          sectionIdName,
          Entity.payment_date,
          Entity.received_by_name,
          Entity.payment_method,
          Entity.card_division,
          Entity.card_type,
          Entity.card_transaction_id,
          Entity.card_bank_name,
          Entity.net_banking_division,
          Entity.net_banking_transaction_id,
          Entity.upi_id,
          Entity.upi_bank_name,
          Entity.upi_transaction_id,
          numbers,
        ],
      );
      const [getPatMobileno] = await this.dynamicConnection.query(
        `select aayush_unique_id from patients where id = ?`,
        [Entity.patient_id],
      );

      const [getAdminPatientId] = await this.connection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getPatMobileno.aayush_unique_id],
      );

      const AdmininsertTransaction = await this.connection.query(
        `insert into transactions (
      txn_id,
      pg_ref_id,
      bank_ref_id,
      type,
      patient_id,
      amount,
      payment_mode,
      Hospital_id,
      hos_transaction_id,
      section,
      payment_date,
      received_by_name,
      payment_method,
        card_division,
        card_type,
        card_transaction_id,
        card_bank_name,
        net_banking_division,
        net_banking_transaction_id,
        upi_id,
        upi_bank_name,
        upi_transaction_id,
      ${idkey}
        ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          Entity.txn_id,
          Entity.pg_ref_id,
          Entity.bank_ref_id,
          'payment',
          getAdminPatientId.id,
          amount,
          Entity.payment_mode,
          Entity.Hospital_id,
          insertTransaction.insertId,
          sectionIdName,
          Entity.payment_date,
          Entity.received_by_name,
          Entity.payment_method,
          Entity.card_division,
          Entity.card_type,
          Entity.card_transaction_id,
          Entity.card_bank_name,
          Entity.net_banking_division,
          Entity.net_banking_transaction_id,
          Entity.upi_id,
          Entity.upi_bank_name,
          Entity.upi_transaction_id,
          adminKey,
        ],
      );
      for (const id of ids) {
        try {
          let [getAdminChargeId] = await this.connection.query(
            `select id from patient_charges where Hospital_id = ? and hos_patient_charges_id = ?`,
            [Entity.Hospital_id, id],
          );

          await this.dynamicConnection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', insertTransaction.insertId, id],
          );

          this.connection.query(
            `update patient_charges set payment_status = ?,transaction_id = ? where id = ?`,
            ['paid', AdmininsertTransaction.insertId, getAdminChargeId.id],
          );
        } catch (error) {
          console.log(error, 'error');
        }
      }

      return {
        status: 'success',
        message: 'payment done successfully',
        transactionId: 'TRID' + insertTransaction.insertId,
      };
    } catch (error) {
      console.log(error, 'error');

      return error;
    }
  }
}
