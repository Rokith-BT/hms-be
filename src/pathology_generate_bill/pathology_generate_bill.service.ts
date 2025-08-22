import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PathologyGenerateBill } from './entities/pathology_generate_bill.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PathologyGenerateBillService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createPathologyGenerateBill: PathologyGenerateBill) {

    if (!createPathologyGenerateBill.received_by_name || createPathologyGenerateBill.received_by_name.trim() === '') {
      throw new BadRequestException(process.env.IPD_PAYMENT_VALIDATION_MESSAGE);
    }

    try {
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createPathologyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` ${process.env.VALIDATION_CHECK} ${createPathologyGenerateBill.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyGenerateBill.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyGenerateBill.generated_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyGenerateBill.doctor_id],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_NOT_FOUND} ${createPathologyGenerateBill.doctor_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail1 = staffId1.email;
      const addPathologyBill = await this.connection.query(
        `INSERT into pathology_billing(
    case_reference_id,
    ipd_prescription_basic_id,
    date,
    patient_id,
    doctor_id,
    doctor_name,
    total,
    discount_percentage,
    discount,
    tax_percentage,
    tax,
    net_amount,
    transaction_id,
    note,
    generated_by,
    updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPathologyGenerateBill.case_reference_id,
          createPathologyGenerateBill.ipd_prescription_basic_id,
          timestamp,
          createPathologyGenerateBill.patient_id,
          createPathologyGenerateBill.doctor_id,
          createPathologyGenerateBill.doctor_name,
          createPathologyGenerateBill.total,
          createPathologyGenerateBill.discount_percentage,
          createPathologyGenerateBill.discount,
          createPathologyGenerateBill.tax_percentage,
          createPathologyGenerateBill.tax,
          createPathologyGenerateBill.net_amount,
          createPathologyGenerateBill.transaction_id,
          createPathologyGenerateBill.note,
          createPathologyGenerateBill.generated_by,
          timestamp,
        ],
      );
      const addPathologyBillID = addPathologyBill.insertId;
      let Pathology_transaction_id;
      const Pathology_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pathology_billing_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       received_by,
       payment_gateway,
       payment_reference_number,
       payment_id,
       received_by_name
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Pathology',
          createPathologyGenerateBill.patient_id,
          createPathologyGenerateBill.case_reference_id,
          addPathologyBillID,
          createPathologyGenerateBill.payment_mode,
          createPathologyGenerateBill.amount,
          createPathologyGenerateBill.cheque_no,
          createPathologyGenerateBill.cheque_date,
          createPathologyGenerateBill.attachment,
          createPathologyGenerateBill.attachment_name,
          timestamp,
          createPathologyGenerateBill.note,
          createPathologyGenerateBill.generated_by,
          createPathologyGenerateBill.payment_gateway,
          createPathologyGenerateBill.payment_reference_number,
          createPathologyGenerateBill.payment_id,
          createPathologyGenerateBill.received_by_name
        ],
      );
      Pathology_transaction_id = Pathology_transaction.insertId;
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPathologyGenerateBill.patient_id],
      );
      const [checkPatInAdmin] = await this.dynamicConnection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getAayushUniqueId.aayush_unique_id],
      );
      const dynamicIPDPatientId = checkPatInAdmin.id;
      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [dynamicUpdateStaff1] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail1],
      );
      const dynamicUpdateStaff1ID = dynamicUpdateStaff1.id;

      let DynCaserefID;
      let DynIpdPrescBasicID;
      let DynIPDID;
      if (createPathologyGenerateBill.ipd_prescription_basic_id) {
        const [DynIpdPrescBasic] = await this.dynamicConnection.query(
          'SELECT id,ipd_id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ? and Hospital_id = ?',
          [
            createPathologyGenerateBill.ipd_prescription_basic_id,
            createPathologyGenerateBill.hospital_id,
          ],
        );
        DynIpdPrescBasicID = DynIpdPrescBasic.id;
        DynIPDID = DynIpdPrescBasic.ipd_id;

        const [DynCaseref] = await this.dynamicConnection.query(
          'SELECT case_reference_id FROM ipd_details WHERE id = ? and hospital_id = ?',
          [DynIPDID, createPathologyGenerateBill.hospital_id],
        );
        DynCaserefID = DynCaseref.case_reference_id;
      }

      let Dyn_Pathology_Bill_Basic_id;

      const addDynPathologyBill = await this.dynamicConnection.query(
        `INSERT into pathology_billing(
    case_reference_id,
    ipd_prescription_basic_id,
    date,
    patient_id,
    doctor_id,
    doctor_name,
    total,
    discount_percentage,
    discount,
    tax_percentage,
    tax,
    net_amount,
    transaction_id,
    note,
    generated_by,
    updated_at,
    hospital_id,
    hos_pathology_billing_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          DynCaserefID,
          DynIpdPrescBasicID,
          timestamp,
          dynamicIPDPatientId,
          dynamicUpdateStaff1ID,
          createPathologyGenerateBill.doctor_name,
          createPathologyGenerateBill.total,
          createPathologyGenerateBill.discount_percentage,
          createPathologyGenerateBill.discount,
          createPathologyGenerateBill.tax_percentage,
          createPathologyGenerateBill.tax,
          createPathologyGenerateBill.net_amount,
          createPathologyGenerateBill.transaction_id,
          createPathologyGenerateBill.note,
          dynamicUPTDStaffId,
          timestamp,
          createPathologyGenerateBill.hospital_id,
          addPathologyBillID,
        ],
      );

      Dyn_Pathology_Bill_Basic_id = addDynPathologyBill.insertId;
      await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         pathology_billing_id,
         payment_mode,
         amount,
         cheque_no,
         cheque_date,
         attachment,
         attachment_name,
         payment_date,
         note,
         received_by,
         Hospital_id,
         hos_transaction_id,
         payment_gateway,
         payment_reference_number,
         payment_id,
         received_by_name
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Pathology',
          dynamicIPDPatientId,
          DynCaserefID,
          Dyn_Pathology_Bill_Basic_id,
          createPathologyGenerateBill.payment_mode,
          createPathologyGenerateBill.amount,
          createPathologyGenerateBill.cheque_no,
          createPathologyGenerateBill.cheque_date,
          createPathologyGenerateBill.attachment,
          createPathologyGenerateBill.attachment_name,
          timestamp,
          createPathologyGenerateBill.note,
          dynamicUPTDStaffId,
          createPathologyGenerateBill.hospital_id,
          Pathology_transaction_id,
          createPathologyGenerateBill.payment_gateway,
          createPathologyGenerateBill.payment_reference_number,
          createPathologyGenerateBill.payment_id,
          createPathologyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PATHOLOGY_GENERATE_BILL_MESSAGE,
            Pathology_bill_Values: await this.connection.query(
              'SELECT * FROM pathology_billing WHERE id = ?',
              [addPathologyBillID],
            ),
          },
        },
      ];
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

  async createPathologyReport(
    createPathologyGenerateBill: PathologyGenerateBill[],
  ) {
    try {
      let result;
      const results = [];

      for (const pathology_bill_detailsEntity of createPathologyGenerateBill) {
        const [patientId] = await this.connection.query(
          'SELECT aayush_unique_id FROM patients WHERE id = ?',
          [pathology_bill_detailsEntity.patient_id],
        );
        if (!patientId || patientId.length === 0) {
          throw new Error(
            ` ${process.env.VALIDATION_CHECK} ${pathology_bill_detailsEntity.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
          );
        }
        result = await this.connection.query(
          'INSERT into pathology_report (pathology_bill_id,pathology_id,patient_id,reporting_date,tax_percentage,apply_charge) VALUES (?,?,?,?,?,?)',
          [
            pathology_bill_detailsEntity.pathology_bill_id,
            pathology_bill_detailsEntity.pathology_id,
            pathology_bill_detailsEntity.patient_id,
            pathology_bill_detailsEntity.reporting_date,
            pathology_bill_detailsEntity.tax_percentage,
            pathology_bill_detailsEntity.apply_charge,
          ],
        );
        const [pathologyBill] = await this.dynamicConnection.query(
          `select id from pathology_billing where hospital_id = ? and hos_pathology_billing_id = ?`,
          [
            pathology_bill_detailsEntity.hospital_id,
            pathology_bill_detailsEntity.pathology_bill_id,
          ],
        );
        const pathologyBillID = pathologyBill.id;
        const [getAayushUniqueId] = await this.connection.query(
          `select aayush_unique_id from patients where id = ?`,
          [pathology_bill_detailsEntity.patient_id],
        );
        const [checkPatInAdmin] = await this.dynamicConnection.query(
          `select id from patients where aayush_unique_id = ?`,
          [getAayushUniqueId.aayush_unique_id],
        );
        const dynamicIPDPatientId = checkPatInAdmin.id;
        const [getPathology] = await this.dynamicConnection.query(
          'SELECT id FROM pathology WHERE hos_pathology_id = ? and hospital_id = ?',
          [
            pathology_bill_detailsEntity.pathology_id,
            pathology_bill_detailsEntity.hospital_id,
          ],
        );
        const getPathologyID = getPathology.id;
        await this.dynamicConnection.query(
          'INSERT into pathology_report (pathology_bill_id,pathology_id,patient_id,reporting_date,tax_percentage,apply_charge,hospital_id,hos_pathology_report_id) VALUES (?,?,?,?,?,?,?,?)',
          [
            pathologyBillID,
            getPathologyID,
            dynamicIPDPatientId,
            pathology_bill_detailsEntity.reporting_date,
            pathology_bill_detailsEntity.tax_percentage,
            pathology_bill_detailsEntity.apply_charge,
            pathology_bill_detailsEntity.hospital_id,
            result.insertId,
          ],
        );
        const pathologyReportDetail = await this.connection.query(
          'SELECT * FROM pathology_report where id = ?',
          [result.insertId],
        );
        results.push({
          status: process.env.SUCCESS_STATUS,
          message: process.env.PATHOLOGY_REPORT_MESSAGE,
          pharmacyBillDetail: pathologyReportDetail[0],
          originalInsertId: result.insertId,
        });
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.PATHOLOGY_REPORT_MESSAGE,
        data: results,
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

  async AddPathologyPayment(
    createPathologyGenerateBill: PathologyGenerateBill,
  ) {

    if (!createPathologyGenerateBill.received_by_name || createPathologyGenerateBill.received_by_name.trim() === '') {
      throw new BadRequestException(process.env.IPD_PAYMENT_VALIDATION_MESSAGE);
    }

    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createPathologyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` ${process.env.VALIDATION_CHECK} ${createPathologyGenerateBill.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyGenerateBill.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyGenerateBill.received_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      let Pathology_transaction_id;
      const Pathology_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pathology_billing_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       received_by,
       payment_gateway,
       payment_reference_number,
       payment_id,
       received_by_name
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Pathology',
          createPathologyGenerateBill.patient_id,
          createPathologyGenerateBill.case_reference_id,
          createPathologyGenerateBill.pathology_billing_id,
          createPathologyGenerateBill.payment_mode,
          createPathologyGenerateBill.amount,
          createPathologyGenerateBill.cheque_no,
          createPathologyGenerateBill.cheque_date,
          createPathologyGenerateBill.attachment,
          createPathologyGenerateBill.attachment_name,
          createPathologyGenerateBill.payment_date,
          createPathologyGenerateBill.note,
          createPathologyGenerateBill.received_by,
          createPathologyGenerateBill.payment_gateway,
          createPathologyGenerateBill.payment_reference_number,
          createPathologyGenerateBill.payment_id,
          createPathologyGenerateBill.received_by_name
        ],
      );

      Pathology_transaction_id = Pathology_transaction.insertId;

      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPathologyGenerateBill.patient_id],
      );
      const [checkPatInAdmin] = await this.dynamicConnection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getAayushUniqueId.aayush_unique_id],
      );
      const dynamicIPDPatientId = checkPatInAdmin.id;

      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [getpathobill] = await this.dynamicConnection.query(
        'SELECT id FROM pathology_billing WHERE hos_pathology_billing_id = ? and hospital_id =?',
        [
          createPathologyGenerateBill.pathology_billing_id,
          createPathologyGenerateBill.hospital_id,
        ],
      );
      const getpathobillID = getpathobill.id;
      const [DynCaseref] = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM pathology_billing WHERE id = ?',
        [getpathobillID],
      );
      const DynCaserefID = DynCaseref.case_reference_id;

      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pathology_billing_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       received_by,
       Hospital_id,
       hos_transaction_id,
       payment_gateway,
       payment_reference_number,
       payment_id,
       received_by_name
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Pathology',
          dynamicIPDPatientId,
          DynCaserefID,
          getpathobillID,
          createPathologyGenerateBill.payment_mode,
          createPathologyGenerateBill.amount,
          createPathologyGenerateBill.cheque_no,
          createPathologyGenerateBill.cheque_date,
          createPathologyGenerateBill.attachment,
          createPathologyGenerateBill.attachment_name,
          createPathologyGenerateBill.payment_date,
          createPathologyGenerateBill.note,
          dynamicUPTDStaffId,
          createPathologyGenerateBill.hospital_id,
          Pathology_transaction_id,
          createPathologyGenerateBill.payment_gateway,
          createPathologyGenerateBill.payment_reference_number,
          createPathologyGenerateBill.payment_id,
          createPathologyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PAYMENT_BILL_ADDED_MESSAGE,
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [Pathology_transaction_id],
            ),
          },
        },
      ];
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

  async removePathologyBill(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM transactions WHERE pathology_billing_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM pathology_report WHERE pathology_bill_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM pathology_billing WHERE id = ?',
        [id],
      );

      let dynamicPathoBillId;

      const [dynamicPatho] = await this.dynamicConnection.query(
        'SELECT id FROM pathology_billing WHERE hos_pathology_billing_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicPathoBillId = dynamicPatho.id;

      await this.dynamicConnection.query(
        'DELETE FROM pathology_report WHERE pathology_bill_id = ? and hospital_id = ?',
        [dynamicPathoBillId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pathology_billing WHERE id = ? and hospital_id = ?',
        [dynamicPathoBillId, hospital_id],
      );
      await this.dynamicConnection.query(
        'UPDATE transactions SET is_deleted = 1 WHERE pathology_billing_id = ? and Hospital_id = ?',
        [dynamicPathoBillId, hospital_id],
      );

      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.PATHOLOGY_BILL_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async deletePathoPayment(
    id: number,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM transactions WHERE id = ?', [
        id,
      ]);

      await this.dynamicConnection.query(
        'UPDATE transactions SET is_deleted = 1 WHERE hos_transaction_id = ? and Hospital_id = ?',
        [id, Hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.PAYMENT_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async removepathoreport(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM pathology_report WHERE id = ?', [
        id,
      ]);

      await this.dynamicConnection.query(
        'DELETE FROM pathology_report WHERE hos_pathology_report_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.PATHOLOGY_REPORT_BILL_WITH_ID} ${id} ${process.env.IPD_RETURN_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
  async updatePathologyBilling(
    id: number,
    createPathologyTest: PathologyGenerateBill,
  ) {
    try {
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createPathologyTest.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` ${process.env.VALIDATION_CHECK} ${createPathologyTest.patient_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyTest.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyTest.generated_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyTest.doctor_id],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyTest.doctor_id} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail1 = staffId1.email;
      await this.connection.query(
        `update pathology_billing SET
    date=?,
    patient_id=?,
    doctor_id=?,
    doctor_name=?,
    total=?,
    discount_percentage=?,
    discount=?,
    tax_percentage=?,
    tax=?,
    net_amount=?,
    note=?,
    generated_by=?,
    updated_at=?
    where id=?`,
        [
          timestamp,
          createPathologyTest.patient_id,
          createPathologyTest.doctor_id,
          createPathologyTest.doctor_name,
          createPathologyTest.total,
          createPathologyTest.discount_percentage,
          createPathologyTest.discount,
          createPathologyTest.tax_percentage,
          createPathologyTest.tax,
          createPathologyTest.net_amount,
          createPathologyTest.note,
          createPathologyTest.generated_by,
          timestamp,
          id,
        ],
      );

      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPathologyTest.patient_id],
      );
      const [checkPatInAdmin] = await this.dynamicConnection.query(
        `select id from patients where aayush_unique_id = ?`,
        [getAayushUniqueId.aayush_unique_id],
      );
      const dynamicIPDPatientId = checkPatInAdmin.id;
      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [dynamicUpdateStaff1] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail1],
      );
      const dynamicUpdateStaff1ID = dynamicUpdateStaff1.id;
      const [dynPathology] = await this.dynamicConnection.query(
        `select id from pathology_billing where hospital_id = ? and  hos_pathology_billing_id = ?`,
        [createPathologyTest.hospital_id, id],
      );
      const dynPathologyID = dynPathology.id;
      await this.dynamicConnection.query(
        `update pathology_billing SET
              date=?,
              patient_id=?,
              doctor_id=?,
              doctor_name=?,
              total=?,
              discount_percentage=?,
              discount=?,
              tax_percentage=?,
              tax=?,
              net_amount=?,
              note=?,
              generated_by=?,
              updated_at=?,
              hospital_id=?
              where id=?`,
        [
          timestamp,
          dynamicIPDPatientId,
          dynamicUpdateStaff1ID,
          createPathologyTest.doctor_name,
          createPathologyTest.total,
          createPathologyTest.discount_percentage,
          createPathologyTest.discount,
          createPathologyTest.tax_percentage,
          createPathologyTest.tax,
          createPathologyTest.net_amount,
          createPathologyTest.note,
          dynamicUPTDStaffId,
          timestamp,
          createPathologyTest.hospital_id,
          dynPathologyID,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PATHOLOGY_BILL_DETAIL_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM pathology_billing WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updatepathologyReport(createPathologyTest: PathologyGenerateBill[]) {
    try {
      for (const patho_reportEntity of createPathologyTest) {
        const [getAdminPathoId] = await this.dynamicConnection.query(
          `select id from pathology where hospital_id = ? and hos_pathology_id = ?`,
          [patho_reportEntity.hospital_id, patho_reportEntity.pathology_id],
        );

        const [getAdminPathoBillingId] = await this.dynamicConnection.query(
          `select id from pathology_billing where hospital_id = ? and hos_pathology_billing_id = ?`,
          [
            patho_reportEntity.hospital_id,
            patho_reportEntity.pathology_bill_id,
          ],
        );

        if (patho_reportEntity.id) {
          const [getAdminPathoReportId] = await this.dynamicConnection.query(
            `select id from pathology_report where hospital_id = ? and hos_pathology_report_id = ?`,
            [patho_reportEntity.hospital_id, patho_reportEntity.id],
          );
          this.connection.query(
            `update pathology_report set pathology_id = ?,
                reporting_date = ?,
                tax_percentage = ?,
                apply_charge = ?
                where id = ?`,
            [
              patho_reportEntity.pathology_id,
              patho_reportEntity.reporting_date,
              patho_reportEntity.tax_percentage,
              patho_reportEntity.apply_charge,
              patho_reportEntity.id,
            ],
          );
          this.dynamicConnection.query(
            `update pathology_report set pathology_id = ?,
                  reporting_date = ?,
                  tax_percentage = ?,
                  apply_charge = ?
                  where id = ?`,
            [
              getAdminPathoId.id,
              patho_reportEntity.reporting_date,
              patho_reportEntity.tax_percentage,
              patho_reportEntity.apply_charge,
              getAdminPathoReportId.id,
            ],
          );
        } else {
          const [getPatDetailInHms] = await this.connection.query(
            `select * from patients where id = ?`,
            [patho_reportEntity.patient_id],
          );
          const [getAdminPatId] = await this.dynamicConnection.query(
            `select id from patients where aayush_unique_id = ?`,
            [getPatDetailInHms.aayush_unique_id],
          );
          const insertHms = await this.connection.query(
            `insert into pathology_report (pathology_bill_id,
                pathology_id,
                patient_id,
                reporting_date,
                tax_percentage,
                apply_charge) values (?,?,?,?,?,?)`,
            [
              patho_reportEntity.pathology_bill_id,
              patho_reportEntity.pathology_id,
              patho_reportEntity.patient_id,
              patho_reportEntity.reporting_date,
              patho_reportEntity.tax_percentage,
              patho_reportEntity.apply_charge,
            ],
          );
          await this.dynamicConnection.query(
            `insert into pathology_report (pathology_bill_id,
                  pathology_id,
                  patient_id,
                  reporting_date,
                  tax_percentage,
                  apply_charge,
                  hospital_id,
                  hos_pathology_report_id) values (?,?,?,?,?,?,?,?)`,
            [
              getAdminPathoBillingId.id,
              getAdminPathoId.id,
              getAdminPatId.id,
              patho_reportEntity.reporting_date,
              patho_reportEntity.tax_percentage,
              patho_reportEntity.apply_charge,
              patho_reportEntity.hospital_id,
              insertHms.insertId,
            ],
          );
        }
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.PATHOLOGY_REPORTS_UPDATED,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateCollectedPerson(
    id: number,
    createPathologyTest: PathologyGenerateBill,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyTest.collection_specialist],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyTest.collection_specialist} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update pathology_report SET
    collection_specialist=?,
    collection_date=?,
    pathology_center=?
    where id=?`,
        [
          createPathologyTest.collection_specialist,
          createPathologyTest.collection_date,
          createPathologyTest.pathology_center,
          id,
        ],
      );
      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;

      const [dynPathologyreport] = await this.dynamicConnection.query(
        `select id from pathology_report where hospital_id = ? and  hos_pathology_report_id = ?`,
        [createPathologyTest.hospital_id, id],
      );
      const dynPathologyreportID = dynPathologyreport.id;

      await this.dynamicConnection.query(
        `update pathology_report SET
              collection_specialist=?,
              collection_date=?,
              pathology_center=?,
              hospital_id=?
              where id=?`,
        [
          dynamicUPTDStaffId,
          createPathologyTest.collection_date,
          createPathologyTest.pathology_center,
          createPathologyTest.hospital_id,
          dynPathologyreportID,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS,
            messege: process.env.PATHOLOGY_REPORTS_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM pathology_report WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateApprovalByPerson(
    id: number,
    createPathologyTest: PathologyGenerateBill,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPathologyTest.approved_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `${process.env.VALIDATION_STAFF} ${createPathologyTest.approved_by} ${process.env.VALIDATION_NOT_FOUND}`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `UPDATE pathology_report SET
          parameter_update=?,
          approved_by=?,
          pathology_report=?,
          report_name=?,
          pathology_result=?
          WHERE id=?`,
        [
          createPathologyTest.parameter_update,
          createPathologyTest.approved_by,
          createPathologyTest.pathology_report,
          createPathologyTest.report_name,
          createPathologyTest.pathology_result,
          id,
        ],
      );
      let pathoReportParameterdetailsid;
      const existingParameter = await this.connection.query(
        `SELECT id FROM pathology_report_parameterdetails WHERE pathology_report_id = ? AND pathology_parameterdetail_id = ?`,
        [id, createPathologyTest.pathology_parameterdetail_id],
      );
      if (existingParameter.length > 0) {
        await this.connection.query(
          `UPDATE pathology_report_parameterdetails SET pathology_report_value = ? WHERE id = ?`,
          [createPathologyTest.pathology_report_value, existingParameter[0].id],
        );
        pathoReportParameterdetailsid = existingParameter[0].id;
      } else {
        const Pathoreportparameter = await this.connection.query(
          `INSERT INTO pathology_report_parameterdetails (
            pathology_report_id,
            pathology_parameterdetail_id,
            pathology_report_value
          ) VALUES (?,?,?)`,
          [
            id,
            createPathologyTest.pathology_parameterdetail_id,
            createPathologyTest.pathology_report_value,
          ],
        );
        pathoReportParameterdetailsid = Pathoreportparameter.insertId;
      }
      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const getDynpathorpt = await this.dynamicConnection.query(
        'SELECT id FROM pathology_report WHERE hos_pathology_report_id = ? AND hospital_id = ?',
        [id, createPathologyTest.hospital_id],
      );
      const getDynpathorptID =
        getDynpathorpt.length > 0 ? getDynpathorpt[0].id : null;
      const getDynpathoparameter = await this.dynamicConnection.query(
        'SELECT id FROM pathology_parameterdetails WHERE hos_pathology_parameterdetails_id = ? AND hospital_id = ?',
        [
          createPathologyTest.pathology_parameterdetail_id,
          createPathologyTest.hospital_id,
        ],
      );
      const getDynpathoparameterID =
        getDynpathoparameter.length > 0 ? getDynpathoparameter[0].id : null;

      if (getDynpathorptID) {
        await this.dynamicConnection.query(
          `UPDATE pathology_report SET
            parameter_update=?,
            approved_by=?,
            pathology_report=?,
            report_name=?,
            pathology_result=?,
            hospital_id=?
            WHERE id=?`,
          [
            createPathologyTest.parameter_update,
            dynamicUPTDStaffId,
            createPathologyTest.pathology_report,
            createPathologyTest.report_name,
            createPathologyTest.pathology_result,
            createPathologyTest.hospital_id,
            getDynpathorptID,
          ],
        );
      }
      if (getDynpathorptID && getDynpathoparameterID) {
        const existingDynParameter = await this.dynamicConnection.query(
          `SELECT id FROM pathology_report_parameterdetails WHERE pathology_report_id = ? AND pathology_parameterdetail_id = ?`,
          [getDynpathorptID, getDynpathoparameterID],
        );

        if (existingDynParameter.length > 0) {
          await this.dynamicConnection.query(
            `UPDATE pathology_report_parameterdetails SET pathology_report_value = ? WHERE id = ?`,
            [
              createPathologyTest.pathology_report_value,
              existingDynParameter[0].id,
            ],
          );
        } else {
          await this.dynamicConnection.query(
            `INSERT INTO pathology_report_parameterdetails (
              pathology_report_id,
              pathology_parameterdetail_id,
              pathology_report_value,
              hospital_id,
              hos_pathology_report_parameterdetails_id
            ) VALUES (?,?,?,?,?)`,
            [
              getDynpathorptID,
              getDynpathoparameterID,
              createPathologyTest.pathology_report_value,
              createPathologyTest.hospital_id,
              pathoReportParameterdetailsid,
            ],
          );
        }
      }

      return {
        status: process.env.SUCCESS_STATUS,
        message: process.env.PATHOLOGY_REPORTS_UPDATED,
        updated_values: await this.connection.query(
          'SELECT * FROM pathology_report WHERE id = ?',
          [id],
        ),
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
