import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalOpdPayment,
  InternalOpdPaymentv3,
} from './entities/internal-opd-payment.entity';
import { CountDto } from './internal-opd-payment.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class InternalOpdPaymentService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(InternalOpdPayment: InternalOpdPayment) {
    if (
      !InternalOpdPayment.received_by_name ||
      InternalOpdPayment.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    try {
      const [case_id] = await this.connection.query(
        `select case_reference_id,patient_id from opd_details where id = ?`,
        [InternalOpdPayment.opd_id],
      );

      const [app_id] = await this.connection.query(
        `select id from appointment where case_reference_id = ?`,
        [case_id.case_reference_id],
      );

      const HOSaddRow = await this.connection.query(
        `INSERT INTO transactions(type,section, case_reference_id,patient_id, opd_id,appointment_id,
         payment_date, amount, payment_mode, note,
         payment_gateway,payment_reference_number,payment_id,received_by_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)`,
        [
          'Payment',
          'OPD',
          case_id.case_reference_id,
          case_id.patient_id,
          InternalOpdPayment.opd_id,
          app_id.id,
          InternalOpdPayment.payment_date,
          InternalOpdPayment.amount,
          InternalOpdPayment.payment_mode,
          InternalOpdPayment.note,
          InternalOpdPayment.payment_gateway,
          InternalOpdPayment.payment_reference_number,
          InternalOpdPayment.payment_id,
          InternalOpdPayment.received_by_name,
        ],
      );
      // console.log('qqqq', HOSaddRow);

      // console.log('case_id', case_id.case_reference_id);
      // console.log('app_id', app_id.id);

      const dev_amounts = await this.connection.query(
        `select id,amount from patient_charges where opd_id = ? and payment_status = "unpaid"`,
        [InternalOpdPayment.opd_id],
      );
      // console.log('qqqq', dev_amounts);

      try {
        for (const patient_charges of dev_amounts) {
          await this.connection.query(
            `update patient_charges SET payment_status = ?, balance = ?, total = ?,  
     transaction_id = ? where opd_id = ? and payment_status = "unpaid" and id = ?`,
            [
              'paid',
              '0',
              patient_charges.amount,
              HOSaddRow.insertId,
              InternalOpdPayment.opd_id,
              patient_charges.id,
            ],
          );
        }
        // console.log('tttttt');

        let AdminCaseRef;
        let AdminOpd;
        const [opd_payment] = await this.dynamicConnection.query(
          `select id,case_reference_id,patient_id from opd_details where Hospital_id = ?
         and hos_opd_id = ?`,
          [InternalOpdPayment.Hospital_id, InternalOpdPayment.opd_id],
        );
        // console.log('yyyy');

        AdminCaseRef = opd_payment.case_reference_id;
        AdminOpd = opd_payment.id;

        const [admin_appt_id] = await this.dynamicConnection.query(
          `select id from appointment where Hospital_id = ? and hos_appointment_id = ?`,
          [InternalOpdPayment.Hospital_id, app_id.id],
        );
        // console.log('ooooo', admin_appt_id.id);

        const AdminaddRow = await this.dynamicConnection.query(
          `INSERT INTO transactions(type,section, case_reference_id,
           patient_id, opd_id,appointment_id, payment_date, amount,
           Payment_mode, note,Hospital_id,hos_transaction_id,payment_gateway,payment_reference_number,payment_id,received_by_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)`,
          [
            'Payment',
            'OPD',
            AdminCaseRef,
            opd_payment.patient_id,
            AdminOpd,
            admin_appt_id.id,
            InternalOpdPayment.payment_date,
            InternalOpdPayment.amount,
            InternalOpdPayment.payment_mode,
            InternalOpdPayment.note,
            InternalOpdPayment.Hospital_id,
            HOSaddRow.insertId,
            InternalOpdPayment.payment_gateway,
            InternalOpdPayment.payment_reference_number,
            InternalOpdPayment.payment_id,
            InternalOpdPayment.received_by_name,
          ],
        );
        // console.log('eee');

        const admin_amount = await this.dynamicConnection.query(
          `select id,amount from patient_charges where opd_id = ? and payment_status = "unpaid";`,
          [AdminOpd],
        );
        for (const admin_patient_charges of admin_amount) {
          await this.dynamicConnection.query(
            `update patient_charges SET payment_status = ?, balance = ?, total = ?, transaction_id = ?
       where Hospital_id = ? and opd_id = ? and payment_status = "unpaid" and id = ?`,
            [
              'paid',
              '0',
              admin_patient_charges.amount,
              AdminaddRow.insertId,
              InternalOpdPayment.Hospital_id,
              AdminOpd,
              admin_patient_charges.id,
            ],
          );
        }
        // console.log('rrr');
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.ERROR_MESSAGE,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return [
        {
          data: {
            'id ': HOSaddRow.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PAYMENT,
            inserted_data: await this.connection.query(
              'SELECT * FROM transactions WHERE id = ?',
              [HOSaddRow.insertId],
            ),
          },
        },
      ];
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

  async findALL(patient_id: number, opd_id: number) {
    try {
      const opd_payments = await this.connection.query(
        ` SELECT 
      CONCAT("TRID", transactions.id) AS transaction_ID,
      transactions.payment_date,
      transactions.note,
      transactions.payment_mode,
      transactions.amount,
      transactions.transaction_id,
      transactions.net_banking_transaction_id,
      transactions.upi_transaction_id,
      transactions.payment_id,
      transactions.payment_reference_number
    FROM transactions
    left join appointment on appointment.id = transactions.appointment_id
    left join visit_details on visit_details.id = appointment.visit_details_id
    WHERE 
      transactions.patient_id = ? AND 
      (
          visit_details.opd_details_id = ? OR 
      transactions.opd_id = ?
      )`,
        [patient_id, opd_id, opd_id],
      );

      return opd_payments;
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

  async remove(id: string, hos_id: number) {
    try {
      await this.dynamicConnection.query(
        `
      update transactions set is_deleted = 1
      where Hospital_id = ? and hos_transaction_id = ?`,
        [hos_id, id],
      );
      await this.connection.query(`delete from transactions where id = ?`, [
        id,
      ]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED,
        },
      ];
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

  async findOpdPaymentDetailsSearch(
    patientId: number,
    opdDetailsId: number,
    search: string,
  ): Promise<InternalOpdPayment[]> {
    let query = ` select concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
    transactions.payment_mode,transactions.amount from transactions where patient_id = ? and opd_id = ?  `;

    let values: (number | string)[] = [patientId, opdDetailsId];

    if (search) {
      query += ` AND (concat("TRID",transactions.id) LIKE ?
                      OR transactions.payment_date LIKE ?
                      OR transactions.note LIKE ?
                      OR transactions.payment_mode LIKE ?
                      OR transactions.amount LIKE ? ) `;

      const searchValue = `%${search}%`;
      values.push(
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      );
    }

    try {
      const rows = await this.connection.query(query, values);
      return rows;
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

  async findopdpayment(
    limit: number,
    page: number,
    patient_id: number,
    opdDetailsId: number,
    hospital_id: number,
    search: string,
  ): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';

      if (search) {
        const searchClause = `
      (
      transactions.id LIKE '%${search}%' OR
      transactions.payment_date LIKE '%${search}%' OR
      transactions.note LIKE '%${search}%' OR
      transactions.payment_mode LIKE '%${search}%' OR
      transactions.amount LIKE '%${search}%'
    )`;

        dateCondition += ` AND ${searchClause}`;
      }

      const opd_payment = await this.connection.query(
        `select appointment.id,concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
    transactions.payment_mode,
     CASE 
      WHEN COALESCE(transactions.amount, 0) THEN transactions.amount 
      ELSE COALESCE(transactions.temp_appt_amount, 0) 
    END AS amount,
    transactions.card_transaction_id,
      transactions.net_banking_transaction_id,
      transactions.upi_transaction_id,
      transactions.payment_id,
      transactions.payment_reference_number
     from transactions 
    left join appointment on appointment.id = transactions.appointment_id
    left join visit_details on visit_details.id = appointment.visit_details_id
    WHERE 
      transactions.patient_id = ? AND 
      (transactions.opd_id = ?  
        OR
        visit_details.opd_details_id = ?) ${dateCondition} LIMIT ? OFFSET ?`,
        [patient_id, opdDetailsId, opdDetailsId, Number(limit), Number(offset)],
      );

      const [total_count] = await this.connection.query(
        `
  SELECT COUNT(*) AS total_count
  FROM transactions
  LEFT JOIN appointment ON appointment.id = transactions.appointment_id
  LEFT JOIN visit_details ON visit_details.id = appointment.visit_details_id
  WHERE 
    transactions.patient_id = ? AND 
    (
      visit_details.opd_details_id = ? OR 
      transactions.opd_id = ?
    ) ${dateCondition}`,
        [patient_id, opdDetailsId, opdDetailsId],
      );

      const [getHosTimings] = await this.dynamicConnection.query(
        `select hospital_opening_timing,hospital_closing_timing from hospitals where plenome_id = ?`,
        [hospital_id],
      );
      let a = opd_payment[0];

      for (const a of opd_payment) {
        if (a.transaction_ID) {
          const trnID = a.transaction_ID.replace(/[a-zA-Z]/g, '');
          const [getPlenomeTransactionId] = await this.dynamicConnection.query(
            `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
            [hospital_id, trnID],
          );
          if (getPlenomeTransactionId) {
            a.plenome_transaction_id = getPlenomeTransactionId.id;
          }
        }
      }

      opd_payment.forEach((a) => {
        if (!a.doctor_id) {
          a.slot =
            getHosTimings.hospital_opening_timing +
            ' - ' +
            getHosTimings.hospital_closing_timing;
          // a.end_time = getHosTimings.hospital_closing_timing;
        }
      });

      let variable = {
        details: opd_payment,
        total: total_count.total_count,
        page: page,
        limit: limit,
      };

      return variable;
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

  async createv2(InternalOpdPayment: InternalOpdPaymentv3) {
    if (
      !InternalOpdPayment.received_by_name ||
      InternalOpdPayment.received_by_name.trim() === ''
    ) {
      throw new BadRequestException('Missing required field: received_by_name');
    }
    try {
      const [case_id] = await this.connection.query(
        `select case_reference_id,patient_id from opd_details where id = ?`,
        [InternalOpdPayment.opd_id],
      );
      const HOSaddRow = await this.connection.query(
        `INSERT INTO transactions(type,section, case_reference_id,patient_id, opd_id,
         payment_date, amount, payment_mode, note,
         payment_gateway,payment_reference_number,payment_id,received_by_name,
        payment_method,
        card_division,
        card_type,
        card_transaction_id,
        card_bank_name,
        net_banking_division,
        net_banking_transaction_id,
        upi_id,
        upi_bank_name,
        upi_transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?, ?, ?,?, ?, ?,?, ?, ?, ?)`,
        [
          'Payment',
          'OPD',
          case_id.case_reference_id,
          case_id.patient_id,
          InternalOpdPayment.opd_id,
          InternalOpdPayment.payment_date,
          InternalOpdPayment.amount,
          InternalOpdPayment.payment_mode,
          InternalOpdPayment.note,
          InternalOpdPayment.payment_gateway,
          InternalOpdPayment.payment_reference_number,
          InternalOpdPayment.payment_id,
          InternalOpdPayment.received_by_name,
          InternalOpdPayment.payment_method,
          InternalOpdPayment.card_division,
          InternalOpdPayment.card_type,
          InternalOpdPayment.card_transaction_id,
          InternalOpdPayment.card_bank_name,
          InternalOpdPayment.net_banking_division,
          InternalOpdPayment.net_banking_transaction_id,
          InternalOpdPayment.upi_id,
          InternalOpdPayment.upi_bank_name,
          InternalOpdPayment.upi_transaction_id,
        ],
      );

      const dev_amounts = await this.connection.query(
        `select id,amount from patient_charges where opd_id = ? and payment_status = "unpaid"`,
        [InternalOpdPayment.opd_id],
      );

      try {
        for (const patient_charges of dev_amounts) {
          await this.connection.query(
            `update patient_charges SET payment_status = ?, balance = ?, total = ?,  
     transaction_id = ? where opd_id = ? and payment_status = "unpaid" and id = ?`,
            [
              'paid',
              '0',
              patient_charges.amount,
              HOSaddRow.insertId,
              InternalOpdPayment.opd_id,
              patient_charges.id,
            ],
          );
        }
        let AdminCaseRef;
        let AdminOpd;
        const [opd_payment] = await this.dynamicConnection.query(
          `select id,case_reference_id,patient_id from opd_details where Hospital_id = ?
         and hos_opd_id = ?`,
          [InternalOpdPayment.Hospital_id, InternalOpdPayment.opd_id],
        );
        AdminCaseRef = opd_payment.case_reference_id;
        AdminOpd = opd_payment.id;
        const AdminaddRow = await this.dynamicConnection.query(
          `INSERT INTO transactions(type,section, case_reference_id,
           patient_id, opd_id, payment_date, amount,
           Payment_mode, note,Hospital_id,hos_transaction_id,payment_gateway,payment_reference_number,payment_id,
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
        upi_transaction_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?, ?, ?,?, ?, ?,?, ?, ?,?)`,
          [
            'Payment',
            'OPD',
            AdminCaseRef,
            opd_payment.patient_id,
            AdminOpd,
            InternalOpdPayment.payment_date,
            InternalOpdPayment.amount,
            InternalOpdPayment.payment_mode,
            InternalOpdPayment.note,
            InternalOpdPayment.Hospital_id,
            HOSaddRow.insertId,
            InternalOpdPayment.payment_gateway,
            InternalOpdPayment.payment_reference_number,
            InternalOpdPayment.payment_id,
            InternalOpdPayment.received_by_name,
            InternalOpdPayment.payment_method,
            InternalOpdPayment.card_division,
            InternalOpdPayment.card_type,
            InternalOpdPayment.card_transaction_id,
            InternalOpdPayment.card_bank_name,
            InternalOpdPayment.net_banking_division,
            InternalOpdPayment.net_banking_transaction_id,
            InternalOpdPayment.upi_id,
            InternalOpdPayment.upi_bank_name,
            InternalOpdPayment.upi_transaction_id,
          ],
        );
        const admin_amount = await this.dynamicConnection.query(
          `select id,amount from patient_charges where opd_id = ? and payment_status = "unpaid";`,
          [AdminOpd],
        );
        for (const admin_patient_charges of admin_amount) {
          await this.dynamicConnection.query(
            `update patient_charges SET payment_status = ?, balance = ?, total = ?, transaction_id = ?
       where Hospital_id = ? and opd_id = ? and payment_status = "unpaid" and id = ?`,
            [
              'paid',
              '0',
              admin_patient_charges.amount,
              AdminaddRow.insertId,
              InternalOpdPayment.Hospital_id,
              AdminOpd,
              admin_patient_charges.id,
            ],
          );
        }
      } catch (error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: process.env.ERROR_MESSAGE,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return [
        {
          data: {
            'id ': HOSaddRow.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PAYMENT,
            inserted_data: await this.connection.query(
              'SELECT * FROM transactions WHERE id = ?',
              [HOSaddRow.insertId],
            ),
          },
        },
      ];
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

  async getOpdBalance(opd_id: number): Promise<{ balance: string }> {
    try {
      const [appointment_id] = await this.connection.query(
        `select appointment.id from appointment 
left join visit_details on  appointment.visit_details_id = visit_details.id
left join opd_details on visit_details.opd_details_id = opd_details.id
where opd_details.id = ?`,
        [opd_id],
      );
      console.log('appointment_id', appointment_id.id);

      const [result] = await this.connection.query(
        `
        SELECT 
          IFNULL((
            SELECT SUM(total)
            FROM patient_charges
            WHERE opd_id = ?
          ), 0) AS total_charges,
  
          IFNULL((
            SELECT SUM(amount)
            FROM transactions
            WHERE opd_id = ? or appointment_id = ?
          ), 0) AS total_payments,
  
          FORMAT(
            IFNULL((
              SELECT SUM(total)
              FROM patient_charges
              WHERE opd_id = ?
            ), 0) -
            IFNULL((
              SELECT SUM(amount)
              FROM transactions
              WHERE opd_id = ? or appointment_id = ?
            ), 0),
            2
          ) AS balance
        `,
        [opd_id, opd_id, appointment_id.id, opd_id, opd_id, appointment_id.id],
      );

      return {
        balance: result.balance ?? '0.00',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE_V2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
