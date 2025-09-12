import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  InternalIpdPayment,
  InternalIpdPaymentV2,
} from './entities/internal-ipd-payment.entity';
import { CountDto } from './dto/internal-ipd-payment.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class InternalIpdPaymentService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createInternalIpdPayment: InternalIpdPayment) {
    if (
      !createInternalIpdPayment.received_by_name ||
      createInternalIpdPayment.received_by_name.trim() === ''
    ) {
      throw new BadRequestException(process.env.IPD_PAYMENT_VALIDATION_MESSAGE);
    }

    try {
      const [case_id] = await this.connection.query(
        `select case_reference_id,patient_id from ipd_details where id = ?`,
        [createInternalIpdPayment.ipd_id],
      );

      const [appointment_id] = await this.connection.query(
        `select id from appointment where case_reference_id = ?`,
        [case_id.case_reference_id],
      );

      const HOSaddRow = await this.connection.query(
        `INSERT INTO transactions(type,section, case_reference_id,patient_id, ipd_id,
           payment_date,appointment_id, amount, payment_mode, note,
           payment_gateway,payment_reference_number,payment_id,received_by_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Payment',
          'IPD',
          case_id.case_reference_id,
          case_id.patient_id,
          createInternalIpdPayment.ipd_id,
          createInternalIpdPayment.payment_date,
          appointment_id.id,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.payment_gateway,
          createInternalIpdPayment.payment_reference_number,
          createInternalIpdPayment.payment_id,
          createInternalIpdPayment.received_by_name,
        ],
      );

      const dev_amounts = await this.connection.query(
        `select id,amount from patient_charges where ipd_id = ? and payment_status = "unpaid"`,
        [createInternalIpdPayment.ipd_id],
      );

      for (const patient_charges of dev_amounts) {
        await this.connection.query(
          `update patient_charges SET payment_status = ?, balance = ?, total = ?,  
   transaction_id = ? where ipd_id = ? and payment_status = "unpaid" and id = ?`,
          [
            'paid',
            '0',
            patient_charges.amount,
            HOSaddRow.insertId,
            createInternalIpdPayment.ipd_id,
            patient_charges.id,
          ],
        );
      }

      let AdminCaseRef;
      let AdminIpd;
      const [ipd_payment] = await this.dynamicConnection.query(
        `select id,case_reference_id,patient_id from ipd_details where hospital_id = ?
        and hospital_ipd_details_id = ?`,
        [createInternalIpdPayment.Hospital_id, createInternalIpdPayment.ipd_id],
      );

      AdminCaseRef = ipd_payment.case_reference_id;
      AdminIpd = ipd_payment.id;

      const [dyn_appointment_id] = await this.dynamicConnection.query(
        `select id from appointment where case_reference_id = ? and Hospital_id = ?`,
        [AdminCaseRef, createInternalIpdPayment.Hospital_id],
      );

      const AdminaddRow = await this.dynamicConnection.query(
        `INSERT INTO transactions(type,section, case_reference_id,
          patient_id, ipd_id, payment_date,appointment_id, amount,
          Payment_mode, note,Hospital_id,hos_transaction_id,payment_gateway,payment_reference_number,payment_id,received_by_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?)`,
        [
          'Payment',
          'IPD',
          AdminCaseRef,
          ipd_payment.patient_id,
          AdminIpd,
          createInternalIpdPayment.payment_date,
          dyn_appointment_id.id,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.Hospital_id,
          HOSaddRow.insertId,
          createInternalIpdPayment.payment_gateway,
          createInternalIpdPayment.payment_reference_number,
          createInternalIpdPayment.payment_id,
          createInternalIpdPayment.received_by_name,
        ],
      );

      const admin_amount = await this.dynamicConnection.query(
        `select id,amount from patient_charges where ipd_id = ? and payment_status = "unpaid";`,
        [AdminIpd],
      );
      for (const admin_patient_charges of admin_amount) {
        await this.dynamicConnection.query(
          `update patient_charges SET payment_status = ?, balance = ?, total = ?, transaction_id = ?
     where Hospital_id = ? and ipd_id = ? and payment_status = "unpaid" and id = ?`,
          [
            'paid',
            '0',
            admin_patient_charges.amount,
            AdminaddRow.insertId,
            createInternalIpdPayment.Hospital_id,
            AdminIpd,
            admin_patient_charges.id,
          ],
        );
      }

      return [
        {
          data: {
            'id ': HOSaddRow.insertId,
            status: process.env.SUCCESS_STATUS,
            messege: process.env.IPD_PAYMENT_SUCCESS_MESSAGE,
            inserted_data: await this.connection.query(
              'SELECT * FROM transactions WHERE id = ?',
              [HOSaddRow.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new Error(process.env.CHARGES_ERROR_MSG);
    }
  }

  async findALL(patient_id: number, ipd_id: number) {
    const ipd_payments = await this.connection.query(
      `select transactions.id,concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
    transactions.payment_mode,transactions.amount from transactions where patient_id = ? and ipd_id =? `,
      [patient_id, ipd_id],
    );
    return ipd_payments;
  }

  async update(id: string, createInternalIpdPayment: InternalIpdPayment) {
    if (
      !createInternalIpdPayment.received_by_name ||
      createInternalIpdPayment.received_by_name.trim() === ''
    ) {
      throw new BadRequestException(process.env.IPD_PAYMENT_VALIDATION_MESSAGE);
    }

    try {
      await this.connection.query(
        `update transactions SET  payment_date = ?, amount = ?, payment_mode = ?, note = ? , received_by_name=? where id = ?`,
        [
          createInternalIpdPayment.payment_date,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.received_by_name,
          id,
        ],
      );
      const [ipdpaymentId] = await this.dynamicConnection.query(
        `select id from transactions where
  hos_transaction_id = ? and Hospital_id = ?`,
        [id, createInternalIpdPayment.Hospital_id],
      );
      await this.dynamicConnection.query(
        `update transactions SET payment_date = ?, amount = ?, payment_mode = ?, note = ? , received_by_name=?  where  id = ?`,
        [
          createInternalIpdPayment.payment_date,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.received_by_name,
          ipdpaymentId.id,
        ],
      );

      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS,
            message: process.env.IPD_PAYMENT_UPDATE_SUCCESS_MESSAGE,
            updated_values: await this.connection.query(
              `select * from transactions where id = ?`,
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new Error(process.env.IPD_PAYMENT_ERROR_MESSAGE);
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
          status: process.env.SUCCESS_STATUS,
          message:
            process.env.VALIDATION_CHECK + id + process.env.IPD_PAYMENT_DELETE,
        },
      ];
    } catch (error) {
      throw new Error(process.env.IPD_PAYMENT_DELETE_MESSAGE);
    }
  }

  async findIpdPaymentDetailsSearch(
    patientId: number,
    ipdDetailsId: number,
    search: string,
  ): Promise<InternalIpdPayment[]> {
    let query = ` select transactions.id,concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
      transactions.payment_mode,transactions.amount from transactions where patient_id = ? and ipd_id =?    `;

    let values: (number | string)[] = [patientId, ipdDetailsId];

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
      throw new Error(process.env.IPD_PAYMENT_DB_FAILED_ERROR_MSG);
    }
  }

  async findIpdPaymentDetails(
    ipd_id: number,
    patient_id: number,
    hospital_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id, patient_id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
         select transactions.id,concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
      transactions.payment_mode,transactions.amount,
      transactions.card_transaction_id,
      transactions.net_banking_transaction_id,
      transactions.upi_transaction_id,
      transactions.payment_id,
      transactions.payment_reference_number
      from transactions where ipd_id =? and patient_id = ?`;

      let countQuery = `
        SELECT COUNT(transactions.id) AS total
        from transactions where ipd_id =? and patient_id = ?`;

      if (search) {
        const condition = `
          AND (concat("TRID",transactions.id) LIKE ?
                      OR transactions.payment_date LIKE ?
                      OR transactions.note LIKE ?
                      OR transactions.payment_mode LIKE ?
                      OR transactions.amount LIKE ?
                       )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(5).fill(pattern);
        values = [ipd_id, patient_id, ...searchValues];
      }

      baseQuery += ` ORDER BY transactions.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdPaymentraw = await this.connection.query(
        baseQuery,
        paginatedValues,
      );

      const ipdPayment = ipdPaymentraw.map((item: any) => ({
        ...item,
        amount:
          item.amount != null ? parseFloat(item.amount).toFixed(2) : '0.00',
      }));
      console.log('aaa', ipdPayment);

      const [countResult] = await this.connection.query(countQuery, values);

      const [getHosTimings] = await this.dynamicConnection.query(
        `select hospital_opening_timing,hospital_closing_timing from hospitals where plenome_id = ?`,
        [hospital_id],
      );
      let a = ipdPayment[0];
      console.log('Bbbb');

      for (const a of ipdPayment) {
        if (a.transaction_ID) {
          console.log('ccc', a.transaction_ID);

          const trnID = a.transaction_ID.replace(/[a-zA-Z]/g, '');
          const [getPlenomeTransactionId] = await this.dynamicConnection.query(
            `select id from transactions where Hospital_id = ? and hos_transaction_id = ?`,
            [hospital_id, trnID],
          );
          console.log(getPlenomeTransactionId, 'getPlenomeTransactionId');

          if (getPlenomeTransactionId) {
            a.plenome_transaction_id = getPlenomeTransactionId.id;
          }
        }
      }

      ipdPayment.forEach((a) => {
        if (!a.doctor_id) {
          a.slot =
            getHosTimings.hospital_opening_timing +
            ' - ' +
            getHosTimings.hospital_closing_timing;
          // a.end_time = getHosTimings.hospital_closing_timing;
        }
      });

      console.log(ipdPayment, 'apptwwwww');

      return {
        details: ipdPayment,
        total: countResult?.total ?? 0,
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

  async findIpdPaymentDetail(
    ipd_id: number,
    patient_id: number,
    search: string,
    limit: number,
    page: number,
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [ipd_id, patient_id];
    let searchValues: any[] = [];

    try {
      let baseQuery = `
        select transactions.id,concat("TRID",transactions.id) as transaction_ID,transactions.payment_date,transactions.note,
      transactions.payment_mode,transactions.amount from transactions where ipd_id =? and patient_id = ?`;

      let countQuery = `
        SELECT COUNT(transactions.id) AS total
        from transactions where ipd_id =? and patient_id = ?`;

      if (search) {
        const condition = `
          AND (concat("TRID",transactions.id) LIKE ?
                      OR transactions.payment_date LIKE ?
                      OR transactions.note LIKE ?
                      OR transactions.payment_mode LIKE ?
                      OR transactions.amount LIKE ?
                       )`;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        searchValues = Array(5).fill(pattern);
        values = [ipd_id, patient_id, ...searchValues];
      }

      baseQuery += ` ORDER BY transactions.id DESC LIMIT ? OFFSET ?`;
      const paginatedValues = [...values, limit, offset];

      const ipdPaymentraw = await this.connection.query(
        baseQuery,
        paginatedValues,
      );

      const ipdPayments = ipdPaymentraw.map((item: any) => ({
        ...item,
        amount:
          item.amount != null ? parseFloat(item.amount).toFixed(2) : '0.00',
      }));

      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ipdPayments,
        total: countResult?.total ?? 0,
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

  async V2create(createInternalIpdPayment: InternalIpdPaymentV2) {
    if (
      !createInternalIpdPayment.received_by_name ||
      createInternalIpdPayment.received_by_name.trim() === ''
    ) {
      throw new BadRequestException(process.env.IPD_PAYMENT_VALIDATION_MESSAGE);
    }

    try {
      const [case_id] = await this.connection.query(
        `select case_reference_id,patient_id from ipd_details where id = ?`,
        [createInternalIpdPayment.ipd_id],
      );

      const HOSaddRow = await this.connection.query(
        `INSERT INTO transactions(type,section, case_reference_id,patient_id, ipd_id,
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
        upi_transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?, ?, ?, ?, ?,?,?,?,?,?)`,
        [
          'Payment',
          'IPD',
          case_id.case_reference_id,
          case_id.patient_id,
          createInternalIpdPayment.ipd_id,
          createInternalIpdPayment.payment_date,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.payment_gateway,
          createInternalIpdPayment.payment_reference_number,
          createInternalIpdPayment.payment_id,
          createInternalIpdPayment.received_by_name,
          createInternalIpdPayment.payment_method,
          createInternalIpdPayment.card_division,
          createInternalIpdPayment.card_type,
          createInternalIpdPayment.card_transaction_id,
          createInternalIpdPayment.card_bank_name,
          createInternalIpdPayment.net_banking_division,
          createInternalIpdPayment.net_banking_transaction_id,
          createInternalIpdPayment.upi_id,
          createInternalIpdPayment.upi_bank_name,
          createInternalIpdPayment.upi_transaction_id,
        ],
      );

      const dev_amounts = await this.connection.query(
        `select id,amount from patient_charges where ipd_id = ? and payment_status = "unpaid"`,
        [createInternalIpdPayment.ipd_id],
      );

      for (const patient_charges of dev_amounts) {
        await this.connection.query(
          `update patient_charges SET payment_status = ?, balance = ?, total = ?,  
   transaction_id = ? where ipd_id = ? and payment_status = "unpaid" and id = ?`,
          [
            'paid',
            '0',
            patient_charges.amount,
            HOSaddRow.insertId,
            createInternalIpdPayment.ipd_id,
            patient_charges.id,
          ],
        );
      }

      let AdminCaseRef;
      let AdminIpd;
      const [ipd_payment] = await this.dynamicConnection.query(
        `select id,case_reference_id,patient_id from ipd_details where hospital_id = ?
        and hospital_ipd_details_id = ?`,
        [createInternalIpdPayment.Hospital_id, createInternalIpdPayment.ipd_id],
      );

      AdminCaseRef = ipd_payment.case_reference_id;
      AdminIpd = ipd_payment.id;

      const AdminaddRow = await this.dynamicConnection.query(
        `INSERT INTO transactions(type,section, case_reference_id,
          patient_id, ipd_id, payment_date, amount,
          Payment_mode, note,Hospital_id,hos_transaction_id,payment_gateway,payment_reference_number,payment_id,received_by_name,  payment_method,
        card_division,
        card_type,
        card_transaction_id,
        card_bank_name,
        net_banking_division,
        net_banking_transaction_id,
        upi_id,
        upi_bank_name,
        upi_transaction_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?)`,
        [
          'Payment',
          'IPD',
          AdminCaseRef,
          ipd_payment.patient_id,
          AdminIpd,
          createInternalIpdPayment.payment_date,
          createInternalIpdPayment.amount,
          createInternalIpdPayment.payment_mode,
          createInternalIpdPayment.note,
          createInternalIpdPayment.Hospital_id,
          HOSaddRow.insertId,
          createInternalIpdPayment.payment_gateway,
          createInternalIpdPayment.payment_reference_number,
          createInternalIpdPayment.payment_id,
          createInternalIpdPayment.received_by_name,
          createInternalIpdPayment.payment_method,
          createInternalIpdPayment.card_division,
          createInternalIpdPayment.card_type,
          createInternalIpdPayment.card_transaction_id,
          createInternalIpdPayment.card_bank_name,
          createInternalIpdPayment.net_banking_division,
          createInternalIpdPayment.net_banking_transaction_id,
          createInternalIpdPayment.upi_id,
          createInternalIpdPayment.upi_bank_name,
          createInternalIpdPayment.upi_transaction_id,
        ],
      );

      const admin_amount = await this.dynamicConnection.query(
        `select id,amount from patient_charges where ipd_id = ? and payment_status = "unpaid";`,
        [AdminIpd],
      );
      for (const admin_patient_charges of admin_amount) {
        await this.dynamicConnection.query(
          `update patient_charges SET payment_status = ?, balance = ?, total = ?, transaction_id = ?
     where Hospital_id = ? and ipd_id = ? and payment_status = "unpaid" and id = ?`,
          [
            'paid',
            '0',
            admin_patient_charges.amount,
            AdminaddRow.insertId,
            createInternalIpdPayment.Hospital_id,
            AdminIpd,
            admin_patient_charges.id,
          ],
        );
      }

      return [
        {
          data: {
            'id ': HOSaddRow.insertId,
            status: process.env.SUCCESS_STATUS,
            messege: process.env.IPD_PAYMENT_SUCCESS_MESSAGE,
            inserted_data: await this.connection.query(
              'SELECT * FROM transactions WHERE id = ?',
              [HOSaddRow.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new Error(process.env.CHARGES_ERROR_MSG);
    }
  }



  async getIpdBalanceAmount(ipd_id: number): Promise<{ balance: string }> {
    try {
      const [result] = await this.connection.query(
        `
        SELECT 
          IFNULL((
            SELECT SUM(total)
            FROM patient_charges
            WHERE ipd_id = ?
          ), 0) AS total_charges,
  
          IFNULL((
            SELECT SUM(amount)
            FROM transactions
            WHERE ipd_id = ?
          ), 0) AS total_payments,
  
          FORMAT(
            IFNULL((
              SELECT SUM(total)
              FROM patient_charges
              WHERE ipd_id = ?
            ), 0) -
            IFNULL((
              SELECT SUM(amount)
              FROM transactions
              WHERE ipd_id = ?
            ), 0),
            2
          ) AS balance
        `,
        [ipd_id, ipd_id, ipd_id, ipd_id],
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
