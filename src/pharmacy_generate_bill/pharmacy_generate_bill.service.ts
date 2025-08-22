import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PharmacyGenerateBill } from './entities/pharmacy_generate_bill.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PharmacyGenerateBillService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(createPharmacyGenerateBill: PharmacyGenerateBill) {

    if (!createPharmacyGenerateBill.received_by_name || createPharmacyGenerateBill.received_by_name.trim() === '') {
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
        [createPharmacyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createPharmacyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPharmacyGenerateBill.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createPharmacyGenerateBill.generated_by} not found.`,
        );
      }
      const docemail = staffId.email;
      let Pharmacy_Bill_Basic_id;
      const Pharmacy_Bill_Basic = await this.connection.query(
        `INSERT into pharmacy_bill_basic (
      date,
      patient_id,
      ipd_prescription_basic_id,
      case_reference_id,
      customer_name,
      customer_type,
      doctor_name,
      file,
      total,
      discount_percentage,
      discount,
      tax_percentage,
      tax,
      net_amount,
      note,
      generated_by
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPharmacyGenerateBill.date,
          createPharmacyGenerateBill.patient_id,
          createPharmacyGenerateBill.ipd_prescription_basic_id,
          createPharmacyGenerateBill.case_reference_id,
          createPharmacyGenerateBill.customer_name,
          createPharmacyGenerateBill.customer_type,
          createPharmacyGenerateBill.doctor_name,
          createPharmacyGenerateBill.file,
          createPharmacyGenerateBill.total,
          createPharmacyGenerateBill.discount_percentage,
          createPharmacyGenerateBill.discount,
          createPharmacyGenerateBill.tax_percentage,
          createPharmacyGenerateBill.tax,
          createPharmacyGenerateBill.net_amount,
          createPharmacyGenerateBill.note,
          createPharmacyGenerateBill.generated_by,
        ],
      );
      Pharmacy_Bill_Basic_id = Pharmacy_Bill_Basic.insertId;
      let Pharmacy_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pharmacy_bill_basic_id,
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
          'Pharmacy',
          createPharmacyGenerateBill.patient_id,
          createPharmacyGenerateBill.case_reference_id,
          Pharmacy_Bill_Basic_id,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment_name,
          timestamp,
          createPharmacyGenerateBill.note,
          createPharmacyGenerateBill.generated_by,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );
      Pharmacy_transaction_id = Pharmacy_transaction.insertId;
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPharmacyGenerateBill.patient_id],
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

      let DynCaserefID;
      let DynIpdPrescBasicID;
      let DynIPDID;
      if (createPharmacyGenerateBill.ipd_prescription_basic_id) {
        const [DynIpdPrescBasic] = await this.dynamicConnection.query(
          'SELECT id,ipd_id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ? and Hospital_id = ?',
          [
            createPharmacyGenerateBill.ipd_prescription_basic_id,
            createPharmacyGenerateBill.hospital_id,
          ],
        );
        DynIpdPrescBasicID = DynIpdPrescBasic.id;
        DynIPDID = DynIpdPrescBasic.ipd_id;

        const [DynCaseref] = await this.dynamicConnection.query(
          'SELECT case_reference_id FROM ipd_details WHERE id = ? and hospital_id = ?',
          [DynIPDID, createPharmacyGenerateBill.hospital_id],
        );
        DynCaserefID = DynCaseref.case_reference_id;
      }
      let Dyn_Pharmacy_Bill_Basic_id;
      const Dyn_Pharmacy_Bill_Basic = await this.dynamicConnection.query(
        `INSERT into pharmacy_bill_basic (
      date,
      patient_id,
      ipd_prescription_basic_id,
      case_reference_id,
      customer_name,
      customer_type,
      doctor_name,
      file,
      total,
      discount_percentage,
      discount,
      tax_percentage,
      tax,
      net_amount,
      note,
      generated_by,
      hospital_id,
      hos_pharmacy_bill_basic_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createPharmacyGenerateBill.date,
          dynamicIPDPatientId,
          DynIpdPrescBasicID,
          DynCaserefID,
          createPharmacyGenerateBill.customer_name,
          createPharmacyGenerateBill.customer_type,
          createPharmacyGenerateBill.doctor_name,
          createPharmacyGenerateBill.file,
          createPharmacyGenerateBill.total,
          createPharmacyGenerateBill.discount_percentage,
          createPharmacyGenerateBill.discount,
          createPharmacyGenerateBill.tax_percentage,
          createPharmacyGenerateBill.tax,
          createPharmacyGenerateBill.net_amount,
          createPharmacyGenerateBill.note,
          dynamicUPTDStaffId,
          createPharmacyGenerateBill.hospital_id,
          Pharmacy_Bill_Basic_id,
        ],
      );
      Dyn_Pharmacy_Bill_Basic_id = Dyn_Pharmacy_Bill_Basic.insertId;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pharmacy_bill_basic_id,
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
          'Pharmacy',
          dynamicIPDPatientId,
          DynCaserefID,
          Dyn_Pharmacy_Bill_Basic_id,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment_name,
          timestamp,
          createPharmacyGenerateBill.note,
          dynamicUPTDStaffId,
          createPharmacyGenerateBill.hospital_id,
          Pharmacy_transaction_id,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Pharmacy generate bill details added successfully ',
            Pharmacy_bill_values: await this.connection.query(
              'SELECT * FROM pharmacy_bill_basic where id = ?',
              [Pharmacy_Bill_Basic_id],
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

  async createMedicineBillDetails(
    createPharmacyGenerateBill: PharmacyGenerateBill[],
  ) {
    try {
      let result;
      const results = [];
      for (const medicine_bill_detailsEntity of createPharmacyGenerateBill) {
        result = await this.connection.query(
          'INSERT into pharmacy_bill_detail (pharmacy_bill_basic_id,medicine_batch_detail_id,quantity,sale_price,amount) VALUES (?,?,?,?,?)',
          [
            medicine_bill_detailsEntity.pharmacy_bill_basic_id,
            medicine_bill_detailsEntity.medicine_batch_detail_id,
            medicine_bill_detailsEntity.quantity,
            medicine_bill_detailsEntity.sale_price,
            medicine_bill_detailsEntity.net_amount,
          ],
        );

        const [pharmacyBillBasic] = await this.dynamicConnection.query(
          `select id from pharmacy_bill_basic where hospital_id = ? and hos_pharmacy_bill_basic_id = ?`,
          [
            medicine_bill_detailsEntity.hospital_id,
            medicine_bill_detailsEntity.pharmacy_bill_basic_id,
          ],
        );
        const dynpharmacyBillBasicID = pharmacyBillBasic.id;

        const [getMedicineBatch] = await this.dynamicConnection.query(
          'SELECT id FROM medicine_batch_details WHERE hos_medicine_batch_details_id = ? and hospital_id = ?',
          [
            medicine_bill_detailsEntity.medicine_batch_detail_id,
            medicine_bill_detailsEntity.hospital_id,
          ],
        );
        const getMedicineBatchID = getMedicineBatch.id;
        await this.dynamicConnection.query(
          'INSERT into pharmacy_bill_detail (pharmacy_bill_basic_id,medicine_batch_detail_id,quantity,sale_price,amount,hospital_id,hos_pharmacy_bill_detail_id) VALUES (?,?,?,?,?,?,?)',
          [
            dynpharmacyBillBasicID,
            getMedicineBatchID,
            medicine_bill_detailsEntity.quantity,
            medicine_bill_detailsEntity.sale_price,
            medicine_bill_detailsEntity.net_amount,
            medicine_bill_detailsEntity.hospital_id,
            result.insertId,
          ],
        );

        const pharmacyBillDetail = await this.connection.query(
          'SELECT * FROM pharmacy_bill_detail where id = ?',
          [result.insertId],
        );
        results.push({
          status: 'success',
          message: 'Pharmacy bill detail added successfully',
          pharmacyBillDetail: pharmacyBillDetail[0],
          originalInsertId: result.insertId,
        });
      }
      return {
        status: 'success',
        message: 'All pharmacy bill details added successfully',
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

  async update(id: number, createPharmacyGenerateBill: PharmacyGenerateBill) {


    if (!createPharmacyGenerateBill.received_by_name || createPharmacyGenerateBill.received_by_name.trim() === '') {
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
        [createPharmacyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createPharmacyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPharmacyGenerateBill.generated_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createPharmacyGenerateBill.generated_by} not found.`,
        );
      }
      const docemail = staffId.email;
      await this.connection.query(
        `update pharmacy_bill_basic SET
    date=?,
    patient_id=?,
    ipd_prescription_basic_id=?,
    case_reference_id=?,
    customer_name=?,
    customer_type=?,
    doctor_name=?,
    file=?,
    total=?,
    discount_percentage=?,
    discount=?,
    tax_percentage=?,
    tax=?,
    net_amount=?,
    note=?,
    generated_by=?
    where id=?`,
        [
          createPharmacyGenerateBill.date,
          createPharmacyGenerateBill.patient_id,
          createPharmacyGenerateBill.ipd_prescription_basic_id,
          createPharmacyGenerateBill.case_reference_id,
          createPharmacyGenerateBill.customer_name,
          createPharmacyGenerateBill.customer_type,
          createPharmacyGenerateBill.doctor_name,
          createPharmacyGenerateBill.file,
          createPharmacyGenerateBill.total,
          createPharmacyGenerateBill.discount_percentage,
          createPharmacyGenerateBill.discount,
          createPharmacyGenerateBill.tax_percentage,
          createPharmacyGenerateBill.tax,
          createPharmacyGenerateBill.net_amount,
          createPharmacyGenerateBill.note,
          createPharmacyGenerateBill.generated_by,
          id,
        ],
      );
      let Pharma_transaction_id;
      const Pharma_transaction = await this.connection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         pharmacy_bill_basic_id,
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
          'refund',
          'Pharmacy',
          createPharmacyGenerateBill.patient_id,
          createPharmacyGenerateBill.case_reference_id,
          id,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment,
          timestamp,
          createPharmacyGenerateBill.note,
          createPharmacyGenerateBill.generated_by,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );
      Pharma_transaction_id = Pharma_transaction.insertId;
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPharmacyGenerateBill.patient_id],
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
      let DynCaserefID;
      let DynIpdPrescBasicID;
      let DynIPDID;
      if (createPharmacyGenerateBill.ipd_prescription_basic_id) {
        const [DynIpdPrescBasic] = await this.dynamicConnection.query(
          'SELECT id,ipd_id FROM ipd_prescription_basic WHERE hos_ipd_prescription_basic_id = ? and Hospital_id = ?',
          [
            createPharmacyGenerateBill.ipd_prescription_basic_id,
            createPharmacyGenerateBill.hospital_id,
          ],
        );
        DynIpdPrescBasicID = DynIpdPrescBasic.id;
        DynIPDID = DynIpdPrescBasic.ipd_id;
        const [DynCaseref] = await this.dynamicConnection.query(
          'SELECT case_reference_id FROM ipd_details WHERE id = ? and hospital_id = ?',
          [DynIPDID, createPharmacyGenerateBill.hospital_id],
        );
        DynCaserefID = DynCaseref.case_reference_id;
      }
      const [getDynpharmaBillBasic] = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy_bill_basic WHERE hos_pharmacy_bill_basic_id = ? and hospital_id = ?',
        [id, createPharmacyGenerateBill.hospital_id],
      );
      const getDynpharmaBillBasicID = getDynpharmaBillBasic.id;
      await this.dynamicConnection.query(
        `update pharmacy_bill_basic SET
       date=?,
       patient_id=?,
       ipd_prescription_basic_id=?,
       case_reference_id=?,
       customer_name=?,
       customer_type=?,
       doctor_name=?,
       file=?,
       total=?,
       discount_percentage=?,
       discount=?,
       tax_percentage=?,
       tax=?,
       net_amount=?,
       note=?,
       generated_by=?,
       hospital_id=?
       where id=?`,
        [
          createPharmacyGenerateBill.date,
          dynamicIPDPatientId,
          DynIpdPrescBasicID,
          DynCaserefID,
          createPharmacyGenerateBill.customer_name,
          createPharmacyGenerateBill.customer_type,
          createPharmacyGenerateBill.doctor_name,
          createPharmacyGenerateBill.file,
          createPharmacyGenerateBill.total,
          createPharmacyGenerateBill.discount_percentage,
          createPharmacyGenerateBill.discount,
          createPharmacyGenerateBill.tax_percentage,
          createPharmacyGenerateBill.tax,
          createPharmacyGenerateBill.net_amount,
          createPharmacyGenerateBill.note,
          dynamicUPTDStaffId,
          createPharmacyGenerateBill.hospital_id,
          getDynpharmaBillBasicID,
        ],
      );

      await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         pharmacy_bill_basic_id,
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
          'refund',
          'Pharmacy',
          dynamicIPDPatientId,
          DynCaserefID,
          getDynpharmaBillBasicID,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment_name,
          timestamp,
          createPharmacyGenerateBill.note,
          dynamicUPTDStaffId,
          createPharmacyGenerateBill.hospital_id,
          Pharma_transaction_id,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'Pharma bill basic details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM pharmacy_bill_basic WHERE id = ?',
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

  async PharmaBillDetail(Pharmacybilldetail: PharmacyGenerateBill[]) {
    try {
      for (const PharmaBillDetailEntity of Pharmacybilldetail) {
        const [getAdminBillBasic_id] = await this.dynamicConnection.query(
          `select id from pharmacy_bill_basic where hospital_id = ? and hos_pharmacy_bill_basic_id = ?`,
          [
            PharmaBillDetailEntity.hospital_id,
            PharmaBillDetailEntity.pharmacy_bill_basic_id,
          ],
        );
        const [getAdminMedicineBatchDetail_id] =
          await this.dynamicConnection.query(
            `select id from medicine_batch_details where hospital_id = ? and hos_medicine_batch_details_id = ?`,
            [
              PharmaBillDetailEntity.hospital_id,
              PharmaBillDetailEntity.medicine_batch_detail_id,
            ],
          );
        const [getAdminPharmacyBillDetailId] =
          await this.dynamicConnection.query(
            `select id from pharmacy_bill_detail where hospital_id = ? and hos_pharmacy_bill_detail_id = ?`,
            [PharmaBillDetailEntity.hospital_id, PharmaBillDetailEntity.id],
          );

        await this.connection.query(
          `update pharmacy_bill_detail set pharmacy_bill_basic_id = ?,
        medicine_batch_detail_id =?,
        quantity = ?,
        sale_price = ?,
        amount = ? where id = ?
        `,
          [
            PharmaBillDetailEntity.pharmacy_bill_basic_id,
            PharmaBillDetailEntity.medicine_batch_detail_id,
            PharmaBillDetailEntity.quantity,
            PharmaBillDetailEntity.sale_price,
            PharmaBillDetailEntity.amount,
            PharmaBillDetailEntity.id,
          ],
        );
        await this.dynamicConnection.query(
          `update pharmacy_bill_detail set pharmacy_bill_basic_id = ?,
          medicine_batch_detail_id =?,
          quantity = ?,
          sale_price = ?,
          amount = ? where id = ?
          `,
          [
            getAdminBillBasic_id.id,
            getAdminMedicineBatchDetail_id.id,
            PharmaBillDetailEntity.quantity,
            PharmaBillDetailEntity.sale_price,
            PharmaBillDetailEntity.amount,
            getAdminPharmacyBillDetailId.id,
          ],
        );
      }

      return {
        status: 'success',
        message: 'pharmacy bill detail updated successfully',
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

  async AddPayment(createPharmacyGenerateBill: PharmacyGenerateBill) {

    if (!createPharmacyGenerateBill.received_by_name || createPharmacyGenerateBill.received_by_name.trim() === '') {
      throw new BadRequestException('Missing required field: received_by_name');
    }

    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [createPharmacyGenerateBill.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(
          ` with id: ${createPharmacyGenerateBill.patient_id} not found.`,
        );
      }
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createPharmacyGenerateBill.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createPharmacyGenerateBill.received_by} not found.`,
        );
      }
      const docemail = staffId.email;
      let Pharmacy_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pharmacy_bill_basic_id,
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
          'Pharmacy',
          createPharmacyGenerateBill.patient_id,
          createPharmacyGenerateBill.case_reference_id,
          createPharmacyGenerateBill.pharmacy_bill_basic_id,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment_name,
          createPharmacyGenerateBill.payment_date,
          createPharmacyGenerateBill.note,
          createPharmacyGenerateBill.received_by,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );

      Pharmacy_transaction_id = Pharmacy_transaction.insertId;
      const [getAayushUniqueId] = await this.connection.query(
        `select aayush_unique_id from patients where id = ?`,
        [createPharmacyGenerateBill.patient_id],
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
      const [getpharmabillBasic] = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy_bill_basic WHERE hos_pharmacy_bill_basic_id = ? and hospital_id =?',
        [
          createPharmacyGenerateBill.pharmacy_bill_basic_id,
          createPharmacyGenerateBill.hospital_id,
        ],
      );
      const getpharmabillBasicID = getpharmabillBasic.id;
      const [DynCaseref] = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM pharmacy_bill_basic WHERE id = ?',
        [getpharmabillBasicID],
      );
      const DynCaserefID = DynCaseref.case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       pharmacy_bill_basic_id,
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
          'Pharmacy',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          createPharmacyGenerateBill.payment_mode,
          createPharmacyGenerateBill.amount,
          createPharmacyGenerateBill.cheque_no,
          createPharmacyGenerateBill.cheque_date,
          createPharmacyGenerateBill.attachment,
          createPharmacyGenerateBill.attachment_name,
          createPharmacyGenerateBill.payment_date,
          createPharmacyGenerateBill.note,
          dynamicUPTDStaffId,
          createPharmacyGenerateBill.hospital_id,
          Pharmacy_transaction_id,
          createPharmacyGenerateBill.payment_gateway,
          createPharmacyGenerateBill.payment_reference_number,
          createPharmacyGenerateBill.payment_id,
          createPharmacyGenerateBill.received_by_name
        ],
      );

      return [
        {
          'data ': {
            status: 'success',
            messege: 'Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [Pharmacy_transaction_id],
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

  async removePharmacyBill(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM transactions WHERE pharmacy_bill_basic_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM pharmacy_bill_detail WHERE pharmacy_bill_basic_id = ?',
        [id],
      );
      await this.connection.query(
        'DELETE FROM pharmacy_bill_basic WHERE id = ?',
        [id],
      );
      let dynamicPharmacyBillBasicId;
      const [dynamicPharmacyBillBasic] = await this.dynamicConnection.query(
        'SELECT id FROM pharmacy_bill_basic WHERE hos_pharmacy_bill_basic_id = ? and hospital_id = ?',
        [id, hospital_id],
      );
      dynamicPharmacyBillBasicId = dynamicPharmacyBillBasic.id;

      await this.dynamicConnection.query(
        'UPDATE transactions SET is_deleted = 1 WHERE pharmacy_bill_basic_id = ? and Hospital_id = ?',
        [dynamicPharmacyBillBasicId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pharmacy_bill_detail WHERE pharmacy_bill_basic_id = ? and hospital_id = ?',
        [dynamicPharmacyBillBasicId, hospital_id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pharmacy_bill_basic WHERE id = ? and hospital_id = ?',
        [dynamicPharmacyBillBasicId, hospital_id],
      );
      return [
        {
          status: 'success',
          message: `Pharmacy bill with id: ${id} and associated entries in the dynamic database have been deleted.`,
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

  async removePayment(
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

  async paymentsListByBillBasicID(
    id: number,
  ): Promise<PharmacyGenerateBill | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM pharmacy_bill_basic WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getPharmacyPaymentList = await this.connection.query(
        `SELECT * from transactions where pharmacy_bill_basic_id = ? `,
        [id],
      );
      return getPharmacyPaymentList;
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

  async getPrescDetailsByprescID(
    id: string,
  ): Promise<PharmacyGenerateBill | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_prescription_basic WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getPharmacydetailsByPrescID = await this.connection.query(
        `SELECT ipd_prescription_basic.id,concat('IPDP',"",ipd_prescription_basic.id) AS PrescriptionNo,
        patients.patient_name AS PatientName,ipd_details.case_reference_id AS CaseID,
        medicine_category.medicine_category AS MedicineCategory,
        pharmacy.medicine_name AS MedicineName
         from ipd_prescription_details 
         Left join ipd_prescription_basic on ipd_prescription_basic.id = ipd_prescription_details.basic_id
         Left join ipd_details on ipd_details.id =  ipd_prescription_basic.ipd_id
         Left join patients on patients.id = ipd_details.patient_id
         left join pharmacy on pharmacy.id = ipd_prescription_details.pharmacy_id
         left join medicine_category on medicine_category.id = pharmacy.medicine_category_id
         where ipd_prescription_basic.id = ? `,
        [id],
      );

      return getPharmacydetailsByPrescID;
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

  async getmedicinedetailsByBatchno(
    id: string,
  ): Promise<PharmacyGenerateBill | null> {
    const getPharmacydetailsByPrescID = await this.connection.query(
      `SELECT medicine_batch_details.id,
        medicine_batch_details.expiry AS ExpiryDate,
        medicine_batch_details.available_quantity AS AvailableQty,
        medicine_batch_details.sale_rate AS SalesPrice,
        medicine_batch_details.tax AS Tax
         from medicine_batch_details 
         where medicine_batch_details.batch_no = ? `,
      [id],
    );
    return getPharmacydetailsByPrescID;
  }

  async findAll(): Promise<PharmacyGenerateBill[]> {
    const getPharmacyBillDetails = await this.connection.query(` SELECT 
    pharmacy_bill_basic.id,
    CONCAT('PHAB', pharmacy_bill_basic.id) AS BillNO,
    pharmacy_bill_basic.case_reference_id AS CaseID,
    pharmacy_bill_basic.date AS Date,
    patients.patient_name AS PatientName,
    pharmacy_bill_basic.doctor_name AS DoctorName,
    pharmacy_bill_basic.discount AS Discount,
    pharmacy_bill_basic.net_amount AS Amount,
    IFNULL(SUM(transactions.amount), 0) AS PaidAmount,  -- Sum of all transactions related to the bill
    (pharmacy_bill_basic.net_amount - IFNULL(SUM(transactions.amount), 0)) AS BalanceAmount  -- Net Amount minus total paid
FROM 
    pharmacy_bill_basic
LEFT JOIN 
    transactions ON transactions.pharmacy_bill_basic_id = pharmacy_bill_basic.id  -- Join on pharmacy_bill_basic_id
LEFT JOIN 
    patients ON patients.id = pharmacy_bill_basic.patient_id  -- Join on patient_id
GROUP BY 
    pharmacy_bill_basic.id,  -- Group by the primary key (Bill ID) to calculate SUM correctly
    pharmacy_bill_basic.case_reference_id,
    pharmacy_bill_basic.date,
    patients.patient_name,
    pharmacy_bill_basic.doctor_name,
    pharmacy_bill_basic.discount,
    pharmacy_bill_basic.net_amount;
     `);

    return getPharmacyBillDetails;
  }

  async findPharmacyBillByAll(search: string): Promise<PharmacyGenerateBill[]> {
    let query = ` SELECT 
    pharmacy_bill_basic.id,
    CONCAT('PHAB', pharmacy_bill_basic.id) AS BillNO,
    pharmacy_bill_basic.case_reference_id AS CaseID,
    pharmacy_bill_basic.date AS Date,
    patients.patient_name AS PatientName,
    pharmacy_bill_basic.doctor_name AS DoctorName,
    pharmacy_bill_basic.discount AS Discount,
    pharmacy_bill_basic.net_amount AS Amount,
    IFNULL(SUM(transactions.amount), 0) AS PaidAmount,  -- Sum of all transactions related to the bill
    (pharmacy_bill_basic.net_amount - IFNULL(SUM(transactions.amount), 0)) AS BalanceAmount  -- Net Amount minus total paid
FROM 
    pharmacy_bill_basic
LEFT JOIN 
    transactions ON transactions.pharmacy_bill_basic_id = pharmacy_bill_basic.id  -- Join on pharmacy_bill_basic_id
LEFT JOIN 
    patients ON patients.id = pharmacy_bill_basic.patient_id  -- Join on patient_id

     
  `;
    let values = [];

    if (search) {
      query += `  WHERE ( 
      pharmacy_bill_basic.id like ? or 
      concat('PHAB',"",pharmacy_bill_basic.id) like ? or 
      pharmacy_bill_basic.case_reference_id like ? or 
      pharmacy_bill_basic.date like ? or 
      patients.patient_name like ? or 
      pharmacy_bill_basic.doctor_name like ? or 
      pharmacy_bill_basic.discount like ? or
      pharmacy_bill_basic.net_amount like ? or 
      transactions.amount like ? 
      
      )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }

    let last = ` GROUP BY 
   pharmacy_bill_basic.id,  
   pharmacy_bill_basic.case_reference_id,
   pharmacy_bill_basic.date,
   patients.patient_name,
   pharmacy_bill_basic.doctor_name,
   pharmacy_bill_basic.discount,
   pharmacy_bill_basic.net_amount `;

    let final = query + last;

    const PharmacybillSearch = await this.connection.query(final, values);

    return PharmacybillSearch;
  }

  async getPharmacybillbyID(id: string): Promise<PharmacyGenerateBill | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM pharmacy_bill_basic WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'NOT FOUND',
          message: `ID ${id} does not exist or has already been `,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getPharmacyBilldetailsByID = await this.connection.query(
        ` SELECT 
    pharmacy_bill_basic.id,
    CONCAT('PHAB', pharmacy_bill_basic.id) AS BillNO,
    pharmacy_bill_basic.case_reference_id AS CaseID,
    pharmacy_bill_basic.date AS Date,
    patients.patient_name AS PatientName,
    patients.mobileno AS Phone,
    concat('IPDP',"",ipd_prescription_basic.id) AS PrescriptionNo,
    pharmacy_bill_basic.doctor_name AS DoctorName,
    medicine_category.medicine_category AS MedicineCategory,
    pharmacy.medicine_name AS MedicineName,
    medicine_batch_details.batch_no AS BatchNo,
    medicine_batch_details.expiry AS ExpiryDate,
    medicine_batch_details.quantity AS Quantity,
    medicine_batch_details.tax AS Tax,
    medicine_batch_details.amount AS Amount,
    medicine_batch_details.packing_qty AS Unit,
    transactions.note AS Note,
    transactions.received_by AS CollectedBy,
    pharmacy_bill_basic.total AS Total,
    pharmacy_bill_basic.discount AS Discount,
    pharmacy_bill_basic.tax AS TaxINR,
    pharmacy_bill_basic.net_amount AS Net_Amount,
    IFNULL(SUM(transactions.amount), 0) AS PaidAmount,  
    (pharmacy_bill_basic.net_amount - IFNULL(SUM(transactions.amount), 0)) AS DueAmount,
    (IFNULL(SUM(transactions.amount), 0) - pharmacy_bill_basic.net_amount) AS RefundAmt
    FROM pharmacy_bill_basic
    LEFT JOIN ipd_prescription_basic ON ipd_prescription_basic.id = pharmacy_bill_basic.ipd_prescription_basic_id
    LEFT JOIN transactions ON transactions.pharmacy_bill_basic_id = pharmacy_bill_basic.id  
    LEFT JOIN patients ON patients.id = pharmacy_bill_basic.patient_id 
    LEFT JOIN pharmacy_bill_detail ON pharmacy_bill_detail.pharmacy_bill_basic_id = pharmacy_bill_basic.id  
    LEFT JOIN medicine_batch_details ON medicine_batch_details.id = pharmacy_bill_detail.medicine_batch_detail_id 
    LEFT JOIN pharmacy ON pharmacy.id = medicine_batch_details.pharmacy_id
    LEFT JOIN medicine_category ON medicine_category.id = pharmacy.medicine_category_id
    LEFT JOIN staff ON staff.id = transactions.received_by
    where pharmacy_bill_basic.id = ? `,
        [id],
      );

      return getPharmacyBilldetailsByID;
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

  async removePharmaBillDetail(
    id: number,
    hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'DELETE FROM pharmacy_bill_detail WHERE id = ?',
        [id],
      );
      await this.dynamicConnection.query(
        'DELETE FROM pharmacy_bill_detail WHERE hos_pharmacy_bill_detail_id = ? and hospital_id = ?',
        [id, hospital_id],
      );

      return [
        {
          status: 'success',
          message: `Pharmacy bill with id: ${id} and associated entries in the dynamic database have been deleted.`,
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
