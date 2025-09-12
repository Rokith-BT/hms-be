import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RadiologyGenerateBill } from './entities/radiology_generate_bill.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class RadiologyGenerateBillService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createRadiologyGenerateBill: RadiologyGenerateBill) {

    if (!createRadiologyGenerateBill.received_by_name || createRadiologyGenerateBill.received_by_name.trim() === '') {
      throw new BadRequestException('Missing required field: received_by_name');
    }


    try {
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createRadiologyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createRadiologyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.generated_by} not found.`,
        );
      }
      const docemail = staffId.email;
      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.doctor_id],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.doctor_id} not found.`,
        );
      }
      const docemail1 = staffId1.email;
      const addRadiologyBill = await this.connection.query(
        `INSERT into radiology_billing(
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
          createRadiologyGenerateBill.case_reference_id,
          createRadiologyGenerateBill.ipd_prescription_basic_id,
          timestamp,
          createRadiologyGenerateBill.patient_id,
          createRadiologyGenerateBill.doctor_id,
          createRadiologyGenerateBill.doctor_name,
          createRadiologyGenerateBill.total,
          createRadiologyGenerateBill.discount_percentage,
          createRadiologyGenerateBill.discount,
          createRadiologyGenerateBill.tax_percentage,
          createRadiologyGenerateBill.tax,
          createRadiologyGenerateBill.net_amount,
          createRadiologyGenerateBill.transaction_id,
          createRadiologyGenerateBill.note,
          createRadiologyGenerateBill.generated_by,
          timestamp,
        ],
      );
      const addRadiologyBillID = addRadiologyBill.insertId;
      let Radiology_transaction_id;
      const Radiology_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       radiology_billing_id,
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
          'Radiology',
          createRadiologyGenerateBill.patient_id,
          createRadiologyGenerateBill.case_reference_id,
          addRadiologyBillID,
          createRadiologyGenerateBill.payment_mode,
          createRadiologyGenerateBill.amount,
          createRadiologyGenerateBill.cheque_no,
          createRadiologyGenerateBill.cheque_date,
          createRadiologyGenerateBill.attachment,
          createRadiologyGenerateBill.attachment_name,
          timestamp,
          createRadiologyGenerateBill.note,
          createRadiologyGenerateBill.generated_by,
          createRadiologyGenerateBill.payment_gateway,
          createRadiologyGenerateBill.payment_reference_number,
          createRadiologyGenerateBill.payment_id,
          createRadiologyGenerateBill.received_by_name
        ],
      );
      Radiology_transaction_id = Radiology_transaction.insertId;
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createRadiologyGenerateBill.patient_id],
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
      if (createRadiologyGenerateBill.ipd_prescription_basic_id) {
        const [DynIpdPrescBasic] = await this.dynamicConnection.query(
          'SELECT id,ipd_id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ? and Hospital_id = ?',
          [
            createRadiologyGenerateBill.ipd_prescription_basic_id,
            createRadiologyGenerateBill.hospital_id,
          ],
        );
        DynIpdPrescBasicID = DynIpdPrescBasic.id;
        DynIPDID = DynIpdPrescBasic.ipd_id;
        const [DynCaseref] = await this.dynamicConnection.query(
          'SELECT case_reference_id FROM ipd_details WHERE id = ? and hospital_id = ?',
          [DynIPDID, createRadiologyGenerateBill.hospital_id],
        );
        DynCaserefID = DynCaseref.case_reference_id;
      }
      let Dyn_Radiology_Bill_Basic_id;
      const addDynRadiologyBill = await this.dynamicConnection.query(
        `INSERT into radiology_billing(
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
    hos_radiology_billing_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          DynCaserefID,
          DynIpdPrescBasicID,
          timestamp,
          dynamicIPDPatientId,
          dynamicUpdateStaff1ID,
          createRadiologyGenerateBill.doctor_name,
          createRadiologyGenerateBill.total,
          createRadiologyGenerateBill.discount_percentage,
          createRadiologyGenerateBill.discount,
          createRadiologyGenerateBill.tax_percentage,
          createRadiologyGenerateBill.tax,
          createRadiologyGenerateBill.net_amount,
          createRadiologyGenerateBill.transaction_id,
          createRadiologyGenerateBill.note,
          dynamicUPTDStaffId,
          timestamp,
          createRadiologyGenerateBill.hospital_id,
          addRadiologyBillID,
        ],
      );

      Dyn_Radiology_Bill_Basic_id = addDynRadiologyBill.insertId;

      await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         radiology_billing_id,
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
          'Radiology',
          dynamicIPDPatientId,
          DynCaserefID,
          Dyn_Radiology_Bill_Basic_id,
          createRadiologyGenerateBill.payment_mode,
          createRadiologyGenerateBill.amount,
          createRadiologyGenerateBill.cheque_no,
          createRadiologyGenerateBill.cheque_date,
          createRadiologyGenerateBill.attachment,
          createRadiologyGenerateBill.attachment_name,
          timestamp,
          createRadiologyGenerateBill.note,
          dynamicUPTDStaffId,
          createRadiologyGenerateBill.hospital_id,
          Radiology_transaction_id,
          createRadiologyGenerateBill.payment_gateway,
          createRadiologyGenerateBill.payment_reference_number,
          createRadiologyGenerateBill.payment_id,
          createRadiologyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Radiology generate bill details added successfully ',
            Radiology_bill_Values: await this.connection.query(
              'SELECT * FROM radiology_billing WHERE id = ?',
              [addRadiologyBillID],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createRadiologyReport(
    createRadiologyGenerateBill: RadiologyGenerateBill[],
  ) {
    try {
      let result;
      const results = [];

      for (const radiology_bill_detailsEntity of createRadiologyGenerateBill) {
        const [patientId] = await this.connection.query(
          'SELECT aayush_unique_id FROM patients WHERE id = ?',
          [radiology_bill_detailsEntity.patient_id],
        );
        if (!patientId || patientId.length === 0) {
          throw new Error(
            ` with id: ${radiology_bill_detailsEntity.patient_id} not found.`,
          );
        }
        const [staffId] = await this.connection.query(
          'SELECT email FROM staff WHERE id = ?',
          [radiology_bill_detailsEntity.generated_by],
        );
        if (!staffId || staffId.length === 0) {
          throw new Error(
            `Staff with id: ${radiology_bill_detailsEntity.generated_by} not found.`,
          );
        }
        const docemail = staffId.email;
        result = await this.connection.query(
          'INSERT into radiology_report (radiology_bill_id,radiology_id,patient_id,reporting_date,tax_percentage,apply_charge,consultant_doctor,generated_by,radiology_center) VALUES (?,?,?,?,?,?,?,?,?)',
          [
            radiology_bill_detailsEntity.radiology_bill_id,
            radiology_bill_detailsEntity.radiology_id,
            radiology_bill_detailsEntity.patient_id,
            radiology_bill_detailsEntity.reporting_date,
            radiology_bill_detailsEntity.tax_percentage,
            radiology_bill_detailsEntity.apply_charge,
            radiology_bill_detailsEntity.consultant_doctor,
            radiology_bill_detailsEntity.generated_by,
            'In lab Radiology center',
          ],
        );
        const [radiologyBill] = await this.dynamicConnection.query(
          `select id from radiology_billing where hospital_id = ? and hos_radiology_billing_id = ?`,
          [
            radiology_bill_detailsEntity.hospital_id,
            radiology_bill_detailsEntity.radiology_bill_id,
          ],
        );
        const radiologyBillID = radiologyBill.id;
        const [getAayushUniqueId] = await this.connection.query(
          `select aayush_unique_id from patients where id = ?`,
          [radiology_bill_detailsEntity.patient_id],
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
        const [getRadiology] = await this.dynamicConnection.query(
          'SELECT id FROM radio WHERE hos_radio_id = ? and hospital_id = ?',
          [
            radiology_bill_detailsEntity.radiology_id,
            radiology_bill_detailsEntity.hospital_id,
          ],
        );
        const getRadiologyID = getRadiology.id;

        await this.dynamicConnection.query(
          'INSERT into radiology_report (radiology_bill_id,radiology_id,patient_id,reporting_date,tax_percentage,apply_charge,consultant_doctor,generated_by,radiology_center,hospital_id,hos_radiology_report_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          [
            radiologyBillID,
            getRadiologyID,
            dynamicIPDPatientId,
            radiology_bill_detailsEntity.reporting_date,
            radiology_bill_detailsEntity.tax_percentage,
            radiology_bill_detailsEntity.apply_charge,
            radiology_bill_detailsEntity.consultant_doctor,
            dynamicUPTDStaffId,
            'In lab Radiology center',
            radiology_bill_detailsEntity.hospital_id,
            result.insertId,
          ],
        );
        const radiologyReportDetail = await this.connection.query(
          'SELECT * FROM radiology_report where id = ?',
          [result.insertId],
        );
        results.push({
          status: 'success',
          message: 'radiology report detail added successfully',
          RadiologyReportDetail: radiologyReportDetail[0],
          originalInsertId: result.insertId,
        });
      }
      return {
        status: 'success',
        message: 'All radiology report details added successfully',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async AddRadiologyPayment(
    createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {

    if (!createRadiologyGenerateBill.received_by_name || createRadiologyGenerateBill.received_by_name.trim() === '') {
      throw new BadRequestException('Missing required field: received_by_name');
    }


    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createRadiologyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createRadiologyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.received_by} not found.`,
        );
      }
      const docemail = staffId.email;
      let Radiology_transaction_id;
      const Radiology_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       radiology_billing_id,
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
          'Radiology',
          createRadiologyGenerateBill.patient_id,
          createRadiologyGenerateBill.case_reference_id,
          createRadiologyGenerateBill.radiology_billing_id,
          createRadiologyGenerateBill.payment_mode,
          createRadiologyGenerateBill.amount,
          createRadiologyGenerateBill.cheque_no,
          createRadiologyGenerateBill.cheque_date,
          createRadiologyGenerateBill.attachment,
          createRadiologyGenerateBill.attachment_name,
          createRadiologyGenerateBill.payment_date,
          createRadiologyGenerateBill.note,
          createRadiologyGenerateBill.received_by,
          createRadiologyGenerateBill.payment_gateway,
          createRadiologyGenerateBill.payment_reference_number,
          createRadiologyGenerateBill.payment_id,
          createRadiologyGenerateBill.received_by_name
        ],
      );

      Radiology_transaction_id = Radiology_transaction.insertId;

      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createRadiologyGenerateBill.patient_id],
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
      const [getradiobill] = await this.dynamicConnection.query(
        'SELECT id FROM radiology_billing WHERE hos_radiology_billing_id = ? and hospital_id =?',
        [
          createRadiologyGenerateBill.radiology_billing_id,
          createRadiologyGenerateBill.hospital_id,
        ],
      );
      const getradiobillID = getradiobill.id;
      const [DynCaseref] = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM radiology_billing WHERE id = ?',
        [getradiobillID],
      );
      const DynCaserefID = DynCaseref.case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       radiology_billing_id,
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
          'Radiology',
          dynamicIPDPatientId,
          DynCaserefID,
          getradiobillID,
          createRadiologyGenerateBill.payment_mode,
          createRadiologyGenerateBill.amount,
          createRadiologyGenerateBill.cheque_no,
          createRadiologyGenerateBill.cheque_date,
          createRadiologyGenerateBill.attachment,
          createRadiologyGenerateBill.attachment_name,
          createRadiologyGenerateBill.payment_date,
          createRadiologyGenerateBill.note,
          dynamicUPTDStaffId,
          createRadiologyGenerateBill.hospital_id,
          Radiology_transaction_id,
          createRadiologyGenerateBill.payment_gateway,
          createRadiologyGenerateBill.payment_reference_number,
          createRadiologyGenerateBill.payment_id,
          createRadiologyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [Radiology_transaction_id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeRadiologyBill(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM transactions WHERE radiology_billing_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM radiology_report WHERE radiology_bill_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM radiology_billing WHERE id = ?',
        [id],
      );

      let dynamicRadioBillId;

      const [dynamicRadio] = await this.dynamicConnection.query(
        'SELECT id FROM radiology_billing WHERE hos_radiology_billing_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicRadioBillId = dynamicRadio.id;

      await this.dynamicConnection.query(
        'DELETE FROM radiology_report WHERE radiology_bill_id = ? and hospital_id = ?',
        [dynamicRadioBillId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM radiology_billing WHERE id = ? and hospital_id = ?',
        [dynamicRadioBillId, hospital_id],
      );
      await this.dynamicConnection.query(
        'UPDATE transactions SET is_deleted = 1 WHERE radiology_billing_id = ? and Hospital_id = ?',
        [dynamicRadioBillId, hospital_id],
      );

      return [
        {
          status: 'success',
          message: `Radiology bill with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async deleteRadioPayment(
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
          status: 'success',
          message: `Payment with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async removeRadioreport(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM radiology_report WHERE id = ?', [
        id,
      ]);

      await this.dynamicConnection.query(
        'DELETE FROM radiology_report WHERE hos_radiology_report_id = ? and hospital_id = ?',
        [id, hospital_id],
      );

      return [
        {
          status: 'success',
          message: `radiology report bill with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateRadiologyBilling(
    id: number,
    createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    try {
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createRadiologyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createRadiologyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.generated_by} not found.`,
        );
      }
      const docemail = staffId.email;
      const [staffId1] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.doctor_id],
      );
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.doctor_id} not found.`,
        );
      }
      const docemail1 = staffId1.email;
      await this.connection.query(
        `update radiology_billing SET
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
          createRadiologyGenerateBill.patient_id,
          createRadiologyGenerateBill.doctor_id,
          createRadiologyGenerateBill.doctor_name,
          createRadiologyGenerateBill.total,
          createRadiologyGenerateBill.discount_percentage,
          createRadiologyGenerateBill.discount,
          createRadiologyGenerateBill.tax_percentage,
          createRadiologyGenerateBill.tax,
          createRadiologyGenerateBill.net_amount,
          createRadiologyGenerateBill.note,
          createRadiologyGenerateBill.generated_by,
          timestamp,
          id,
        ],
      );
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createRadiologyGenerateBill.patient_id],
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
      const [dynRadiology] = await this.dynamicConnection.query(
        `select id from radiology_billing where hospital_id = ? and  hos_radiology_billing_id = ?`,
        [createRadiologyGenerateBill.hospital_id, id],
      );
      const dynRadiologyID = dynRadiology.id;
      await this.dynamicConnection.query(
        `update radiology_billing SET
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
          createRadiologyGenerateBill.doctor_name,
          createRadiologyGenerateBill.total,
          createRadiologyGenerateBill.discount_percentage,
          createRadiologyGenerateBill.discount,
          createRadiologyGenerateBill.tax_percentage,
          createRadiologyGenerateBill.tax,
          createRadiologyGenerateBill.net_amount,
          createRadiologyGenerateBill.note,
          dynamicUPTDStaffId,
          timestamp,
          createRadiologyGenerateBill.hospital_id,
          dynRadiologyID,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Radiology billing details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM radiology_billing WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateRadiologyReport(
    createRadiologyGenerateBill: RadiologyGenerateBill[],
  ) {
    try {
      for (const radio_reportEntity of createRadiologyGenerateBill) {
        const [getAdminRadioId] = await this.dynamicConnection.query(
          `select id from radio where hospital_id = ? and hos_radio_id = ?`,
          [radio_reportEntity.hospital_id, radio_reportEntity.radiology_id],
        );
        const [getAdminRadioBillingId] = await this.dynamicConnection.query(
          `select id from radiology_billing where hospital_id = ? and hos_radiology_billing_id = ?`,
          [
            radio_reportEntity.hospital_id,
            radio_reportEntity.radiology_bill_id,
          ],
        );
        if (radio_reportEntity.id) {
          const [getAdminRadioReportId] = await this.dynamicConnection.query(
            `select id from radiology_report where hospital_id = ? and hos_radiology_report_id = ?`,
            [radio_reportEntity.hospital_id, radio_reportEntity.id],
          );

          await this.connection.query(
            `update radiology_report set radiology_id = ?,
                reporting_date = ?,
                tax_percentage = ?,
                apply_charge = ?
                where id = ?`,
            [
              radio_reportEntity.radiology_id,
              radio_reportEntity.reporting_date,
              radio_reportEntity.tax_percentage,
              radio_reportEntity.apply_charge,
              radio_reportEntity.id,
            ],
          );
          await this.dynamicConnection.query(
            `update radiology_report set radiology_id = ?,
                  reporting_date = ?,
                  tax_percentage = ?,
                  apply_charge = ?
                  where id = ?`,
            [
              getAdminRadioId.id,
              radio_reportEntity.reporting_date,
              radio_reportEntity.tax_percentage,
              radio_reportEntity.apply_charge,
              getAdminRadioReportId.id,
            ],
          );
        } else {
          const [getPatDetailInHms] = await this.connection.query(
            `select * from patients where id = ?`,
            [radio_reportEntity.patient_id],
          );
          const [getAdminPatId] = await this.dynamicConnection.query(
            `select id from patients where aayush_unique_id = ?`,
            [getPatDetailInHms.aayush_unique_id],
          );

          const insertHms = await this.connection.query(
            `insert into radiology_report (radiology_bill_id,
                radiology_id,
                patient_id,
                reporting_date,
                tax_percentage,
                apply_charge,
                consultant_doctor,
                radiology_center
                ) values (?,?,?,?,?,?,?,?)`,
            [
              radio_reportEntity.radiology_bill_id,
              radio_reportEntity.radiology_id,
              radio_reportEntity.patient_id,
              radio_reportEntity.reporting_date,
              radio_reportEntity.tax_percentage,
              radio_reportEntity.apply_charge,
              radio_reportEntity.consultant_doctor,
              radio_reportEntity.radiology_center,
            ],
          );
          await this.dynamicConnection.query(
            `insert into radiology_report (radiology_bill_id,
                  radiology_id,
                  patient_id,
                  reporting_date,
                  tax_percentage,
                  apply_charge,
                  consultant_doctor,
                  radiology_center,
                  hospital_id,
                  hos_radiology_report_id
                  ) values (?,?,?,?,?,?,?,?,?,?)`,
            [
              getAdminRadioBillingId.id,
              getAdminRadioId.id,
              getAdminPatId.id,
              radio_reportEntity.reporting_date,
              radio_reportEntity.tax_percentage,
              radio_reportEntity.apply_charge,
              radio_reportEntity.consultant_doctor,
              radio_reportEntity.radiology_center,
              radio_reportEntity.hospital_id,
              insertHms.insertId,
            ],
          );
        }
      }

      return {
        status: 'success',
        message: 'Radiology reports updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateCollectedPerson(
    id: number,
    createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.collection_specialist],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.collection_specialist} not found.`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update radiology_report SET
    collection_specialist=?,
    collection_date=?,
    radiology_center=?
    where id=?`,
        [
          createRadiologyGenerateBill.collection_specialist,
          createRadiologyGenerateBill.collection_date,
          createRadiologyGenerateBill.radiology_center,
          id,
        ],
      );

      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [dynRadiologyreport] = await this.dynamicConnection.query(
        `select id from radiology_report where hospital_id = ? and  hos_radiology_report_id = ?`,
        [createRadiologyGenerateBill.hospital_id, id],
      );
      const dynRadiologyreportID = dynRadiologyreport.id;
      await this.dynamicConnection.query(
        `update radiology_report SET
              collection_specialist=?,
              collection_date=?,
              radiology_center=?,
              hospital_id=?
              where id=?`,
        [
          dynamicUPTDStaffId,
          createRadiologyGenerateBill.collection_date,
          createRadiologyGenerateBill.radiology_center,
          createRadiologyGenerateBill.hospital_id,
          dynRadiologyreportID,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Radiology report details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM radiology_report WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async updateApprovalByPerson(
    id: number,
    createRadiologyGenerateBill: RadiologyGenerateBill,
  ) {
    try {
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createRadiologyGenerateBill.approved_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createRadiologyGenerateBill.approved_by} not found.`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update radiology_report SET
          parameter_update=?,
          approved_by=?,
          radiology_report=?,
          report_name=?,
          radiology_result=?
          where id=?`,
        [
          createRadiologyGenerateBill.parameter_update,
          createRadiologyGenerateBill.approved_by,
          createRadiologyGenerateBill.radiology_report,
          createRadiologyGenerateBill.report_name,
          createRadiologyGenerateBill.radiology_result,
          id,
        ],
      );

      let radioReportParameterdetailsid;

      const radioreportparameter = await this.connection.query(
        `INSERT into radiology_report_parameterdetails (
               radiology_report_id,
               radiology_parameterdetail_id,
               radiology_report_value
                 ) VALUES (?,?,?)`,
        [
          id,
          createRadiologyGenerateBill.radiology_parameterdetail_id,
          createRadiologyGenerateBill.radiology_report_value,
        ],
      );

      radioReportParameterdetailsid = radioreportparameter.insertId;

      const [dynamicUpdateStaff] = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff.id;
      const [getDynradiorpt] = await this.dynamicConnection.query(
        'SELECT id FROM radiology_report WHERE hos_radiology_report_id = ? and hospital_id = ?',
        [id, createRadiologyGenerateBill.hospital_id],
      );
      const getDynradiorptID = getDynradiorpt.id;

      const [getDynRadioparameter] = await this.dynamicConnection.query(
        'SELECT id FROM radiology_parameterdetails WHERE hos_radiology_parameterdetails_id = ? and hospital_id = ?',
        [
          createRadiologyGenerateBill.radiology_parameterdetail_id,
          createRadiologyGenerateBill.hospital_id,
        ],
      );
      const getDynRadioparameterID = getDynRadioparameter.id;
      await this.dynamicConnection.query(
        `update radiology_report SET
              parameter_update=?,
              approved_by=?,
              radiology_report=?,
              report_name=?,
              radiology_result=?,
              hospital_id=?
              where id=?`,
        [
          createRadiologyGenerateBill.parameter_update,
          dynamicUPTDStaffId,
          createRadiologyGenerateBill.radiology_report,
          createRadiologyGenerateBill.report_name,
          createRadiologyGenerateBill.radiology_result,
          createRadiologyGenerateBill.hospital_id,
          getDynradiorptID,
        ],
      );

      await this.dynamicConnection.query(
        `INSERT into radiology_report_parameterdetails (
                 radiology_report_id,
                 radiology_parameterdetail_id,
                 radiology_report_value,
                 hospital_id,
                 hos_radiology_report_parameterdetails_id
                   ) VALUES (?,?,?,?,?)`,
        [
          getDynradiorptID,
          getDynRadioparameterID,
          createRadiologyGenerateBill.radiology_report_value,
          createRadiologyGenerateBill.hospital_id,
          radioReportParameterdetailsid,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Radiology report details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM radiology_report WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
