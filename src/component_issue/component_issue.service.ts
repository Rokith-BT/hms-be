import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ComponentIssue } from './entities/component_issue.entity';


@Injectable()
export class ComponentIssueService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createComponentIssue: ComponentIssue) {
    try {


      const fromDate = new Date()
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');


      const [patientId] = await this.connection.query('SELECT * FROM patients WHERE id = ?', [createComponentIssue.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createComponentIssue.patient_id} not found.`);
      }

      const email = patientId.aayush_unique_id;


      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createComponentIssue.generated_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createComponentIssue.generated_by} not found.`);
      }

      const docemail = staffId.email;


      const [staffId1] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createComponentIssue.hospital_doctor]);
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(`Staff with id: ${createComponentIssue.hospital_doctor} not found.`);
      }

      const docemail1 = staffId1.email;


      const [staffId2] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createComponentIssue.received_by]);
      if (!staffId2 || staffId2.length === 0) {
        throw new Error(`Staff with id: ${createComponentIssue.received_by} not found.`);
      }

      const docemail2 = staffId2.email;



      const addComponentIssue = await this.connection.query(
        `INSERT into blood_issue(
    patient_id,
    case_reference_id,
    blood_donor_cycle_id,
    date_of_issue,
    hospital_doctor,
    reference,
    charge_id,
    standard_charge,
    tax_percentage,
    discount_percentage,
    amount,
    net_amount,
    institution,
    technician,
    remark,
    generated_by
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          createComponentIssue.patient_id,
          createComponentIssue.case_reference_id,
          createComponentIssue.blood_donor_cycle_id,
          createComponentIssue.date_of_issue,
          createComponentIssue.hospital_doctor,
          createComponentIssue.reference,
          createComponentIssue.charge_id,
          createComponentIssue.standard_charge,
          createComponentIssue.tax_percentage,
          createComponentIssue.discount_percentage,
          createComponentIssue.amount,
          createComponentIssue.net_amount,
          createComponentIssue.institution,
          createComponentIssue.technician,
          createComponentIssue.remark,
          createComponentIssue.generated_by
        ],
      )

      const addComponentIssueID = addComponentIssue.insertId;


      let component_issue_transaction_id;


      const component_issue_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       blood_issue_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       received_by
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Blood Bank',
          createComponentIssue.patient_id,
          createComponentIssue.case_reference_id,
          addComponentIssueID,
          createComponentIssue.payment_mode,
          createComponentIssue.amount,
          createComponentIssue.cheque_no,
          createComponentIssue.cheque_date,
          createComponentIssue.attachment,
          createComponentIssue.attachment_name,
          timestamp,
          createComponentIssue.note,
          createComponentIssue.generated_by
        ],
      );

      component_issue_transaction_id = component_issue_transaction.insertId;


      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      const dynamicIPDPatientId = dynamicPatient[0].id;


      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const dynamicUpdateStaff1 = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail1]);
      const dynamicUpdateStaff1ID = dynamicUpdateStaff1[0].id;

      const dynamicUpdateStaff2 = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail2]);
      const dynamicUpdateStaff2ID = dynamicUpdateStaff2[0].id;

      const dynCharge = await this.dynamicConnection.query('SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id=?', [createComponentIssue.charge_id, createComponentIssue.hospital_id]);
      const dynChargeID = dynCharge[0].id;

      let caseReferenceId;


      if (createComponentIssue.case_reference_id) {



        const [DynIpdOpd] = await this.dynamicConnection.query('SELECT opd_id,ipd_id FROM patient_charges WHERE charge_id=? and patient_id=?', [dynChargeID, dynamicIPDPatientId]);
        const DynOpd = DynIpdOpd.opd_id;
        const DynIPD = DynIpdOpd.ipd_id;







        if (DynOpd) {

          const [opdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM opd_details WHERE id=?',
            [DynOpd]
          );
          caseReferenceId = opdDetails ? opdDetails.case_reference_id : null;

        } else if (DynIPD) {

          const [ipdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM ipd_details WHERE id=?',
            [DynIPD]
          );
          caseReferenceId = ipdDetails ? ipdDetails.case_reference_id : null;

        }




      }


      const dynBloodDonorCycle = await this.dynamicConnection.query('SELECT id FROM blood_donor_cycle WHERE hos_blood_donor_cycle_id=? and hospital_id=?', [createComponentIssue.blood_donor_cycle_id, createComponentIssue.hospital_id]);
      const dynBloodDonorCycleID = dynBloodDonorCycle[0].id;



      let Dyn_Component_issue_id;

      const addDynComponentIssue = await this.dynamicConnection.query(
        `INSERT into blood_issue(
    patient_id,
    case_reference_id,
    blood_donor_cycle_id,
    date_of_issue,
    hospital_doctor,
    reference,
    charge_id,
    standard_charge,
    tax_percentage,
    discount_percentage,
    amount,
    net_amount,
    institution,
    technician,
    remark,
    generated_by,
    hospital_id,
    hos_blood_issue_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          dynamicIPDPatientId,
          caseReferenceId,
          dynBloodDonorCycleID,
          createComponentIssue.date_of_issue,
          dynamicUpdateStaff1ID,
          createComponentIssue.reference,
          dynChargeID,
          createComponentIssue.standard_charge,
          createComponentIssue.tax_percentage,
          createComponentIssue.discount_percentage,
          createComponentIssue.amount,
          createComponentIssue.net_amount,
          createComponentIssue.institution,
          createComponentIssue.technician,
          createComponentIssue.remark,
          dynamicUPTDStaffId,
          createComponentIssue.hospital_id,
          addComponentIssueID
        ],
      )

      Dyn_Component_issue_id = addDynComponentIssue.insertId;


      let Dyn_ComponentIssue_transaction_id;


      const Dyn_Component_Issue_transaction = await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         patient_id,
         case_reference_id,
         blood_issue_id,
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
         hos_transaction_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Blood Bank',
          dynamicIPDPatientId,
          caseReferenceId,
          Dyn_Component_issue_id,
          createComponentIssue.payment_mode,
          createComponentIssue.amount,
          createComponentIssue.cheque_no,
          createComponentIssue.cheque_date,
          createComponentIssue.attachment,
          createComponentIssue.attachment_name,
          timestamp,
          createComponentIssue.note,
          dynamicUpdateStaff2ID,
          createComponentIssue.hospital_id,
          component_issue_transaction_id
        ],
      );

      Dyn_ComponentIssue_transaction_id = Dyn_Component_Issue_transaction.insertId;





      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.BLOOD_ISSUE,
          "Blood_Issue_Values": await this.connection.query('SELECT * FROM blood_issue WHERE id = ?', [addComponentIssueID])
        }
      }];


    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async AddPayment(createComponentIssue: ComponentIssue) {
    try {
      const [patientId] = await this.connection.query('SELECT * FROM patients WHERE id = ?', [createComponentIssue.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createComponentIssue.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;

      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createComponentIssue.received_by]);
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${createComponentIssue.received_by} not found.`);
      }
      const docemail = staffId.email;
      let component_issue_transaction_id;

      const component_issue_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       blood_issue_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       received_by
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Blood Bank',
          createComponentIssue.patient_id,
          createComponentIssue.case_reference_id,
          createComponentIssue.blood_issue_id,
          createComponentIssue.payment_mode,
          createComponentIssue.amount,
          createComponentIssue.cheque_no,
          createComponentIssue.cheque_date,
          createComponentIssue.attachment,
          createComponentIssue.attachment_name,
          createComponentIssue.payment_date,
          createComponentIssue.note,
          createComponentIssue.received_by
        ],
      );
      component_issue_transaction_id = component_issue_transaction.insertId;

      // -------------------------------------//

      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      const dynamicIPDPatientId = dynamicPatient[0].id;


      const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

      const getpharmabillBasic = await this.dynamicConnection.query('SELECT id FROM blood_issue WHERE hos_blood_issue_id = ? and hospital_id =?', [createComponentIssue.blood_issue_id, createComponentIssue.hospital_id]);
      const getpharmabillBasicID = getpharmabillBasic[0].id;


      const DynCaseref = await this.dynamicConnection.query('SELECT case_reference_id FROM blood_issue WHERE id = ?', [getpharmabillBasicID]);
      const DynCaserefID = DynCaseref[0].case_reference_id;

      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       blood_issue_id,
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
       hos_transaction_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['payment',
          'Blood Bank',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          createComponentIssue.payment_mode,
          createComponentIssue.amount,
          createComponentIssue.cheque_no,
          createComponentIssue.cheque_date,
          createComponentIssue.attachment,
          createComponentIssue.attachment_name,
          createComponentIssue.payment_date,
          createComponentIssue.note,
          dynamicUPTDStaffId,
          createComponentIssue.hospital_id,
          component_issue_transaction_id
        ],
      );

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.PAYMENT_BILL,
          "Added_Payment_values": await this.connection.query('SELECT * FROM transactions where id = ?', [component_issue_transaction_id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateComponentIssue(id: number, createComponentIssue: ComponentIssue) {
    try {
      const [patientId] = await this.connection.query('SELECT * FROM patients WHERE id = ?', [createComponentIssue.patient_id]);
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${createComponentIssue.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;


      const [staffId1] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createComponentIssue.hospital_doctor]);
      if (!staffId1 || staffId1.length === 0) {
        throw new Error(`Staff with id: ${createComponentIssue.hospital_doctor} not found.`);
      }

      const docemail1 = staffId1.email;
      await this.connection.query(`update blood_issue SET
    patient_id=?,
    case_reference_id=?,
    blood_donor_cycle_id=?,
    date_of_issue=?,
    hospital_doctor=?,
    reference=?,
    charge_id=?,
    standard_charge=?,
    tax_percentage=?,
    discount_percentage=?,
    amount=?,
    net_amount=?,
    institution=?,
    technician=?,
    remark=?
    where id=?`,
        [
          createComponentIssue.patient_id,
          createComponentIssue.case_reference_id,
          createComponentIssue.blood_donor_cycle_id,
          createComponentIssue.date_of_issue,
          createComponentIssue.hospital_doctor,
          createComponentIssue.reference,
          createComponentIssue.charge_id,
          createComponentIssue.standard_charge,
          createComponentIssue.tax_percentage,
          createComponentIssue.discount_percentage,
          createComponentIssue.amount,
          createComponentIssue.net_amount,
          createComponentIssue.institution,
          createComponentIssue.technician,
          createComponentIssue.remark,
          id
        ],
      )



      const dynamicPatient = await this.dynamicConnection.query('SELECT id FROM patients WHERE aayush_unique_id = ?', [email]);
      const dynamicIPDPatientId = dynamicPatient[0].id;

      const dynamicUpdateStaff1 = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail1]);
      const dynamicUpdateStaff1ID = dynamicUpdateStaff1[0].id;
      const getAdminChargeId = await this.dynamicConnection.query(`select id  from charges 
          where Hospital_id = ? and hospital_charges_id = ?`,
        [createComponentIssue.hospital_id,
        createComponentIssue.charge_id
        ])
      const getAdminChargeID = getAdminChargeId[0].id;
      let caseReferenceId;
      if (createComponentIssue.case_reference_id) {

        const [DynIpdOpd] = await this.dynamicConnection.query('SELECT opd_id,ipd_id FROM patient_charges WHERE charge_id=? and patient_id=?', [getAdminChargeID, dynamicIPDPatientId]);
        const DynOpd = DynIpdOpd.opd_id;
        const DynIPD = DynIpdOpd.ipd_id;
        if (DynOpd) {
          const [opdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM opd_details WHERE id=?',
            [DynOpd]
          );
          caseReferenceId = opdDetails ? opdDetails.case_reference_id : null;

        } else if (DynIPD) {
          const [ipdDetails] = await this.dynamicConnection.query(
            'SELECT case_reference_id FROM ipd_details WHERE id=?',
            [DynIPD]
          );
          caseReferenceId = ipdDetails ? ipdDetails.case_reference_id : null;
        }
      }


      const dynBloodDonorCycle = await this.dynamicConnection.query('SELECT id FROM blood_donor_cycle WHERE hos_blood_donor_cycle_id=? and hospital_id=?', [createComponentIssue.blood_donor_cycle_id, createComponentIssue.hospital_id]);
      const dynBloodDonorCycleID = dynBloodDonorCycle[0].id;


      const [GetDynBloodIssue] = await this.dynamicConnection.query(
        'SELECT id FROM blood_issue WHERE hos_blood_issue_id=? and hospital_id=?',
        [id, createComponentIssue.hospital_id]
      );
      const GetDynBloodIssueID = GetDynBloodIssue.id;
      await this.dynamicConnection.query(
        `update blood_issue SET
    patient_id=?,
    case_reference_id=?,
    blood_donor_cycle_id=?,
    date_of_issue=?,
    hospital_doctor=?,
    reference=?,
    charge_id=?,
    standard_charge=?,
    tax_percentage=?,
    discount_percentage=?,
    amount=?,
    net_amount=?,
    institution=?,
    technician=?,
    remark=?,
    hospital_id=?
    where id=?`,
        [
          dynamicIPDPatientId,
          caseReferenceId,
          dynBloodDonorCycleID,
          createComponentIssue.date_of_issue,
          dynamicUpdateStaff1ID,
          createComponentIssue.reference,
          getAdminChargeID,
          createComponentIssue.standard_charge,
          createComponentIssue.tax_percentage,
          createComponentIssue.discount_percentage,
          createComponentIssue.amount,
          createComponentIssue.net_amount,
          createComponentIssue.institution,
          createComponentIssue.technician,
          createComponentIssue.remark,
          createComponentIssue.hospital_id,
          GetDynBloodIssueID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.COMPONENT_ISSUE,
          "updated_values": await this.connection.query('SELECT * FROM blood_issue WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async deleteComponentIssuePayment(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM transactions WHERE id = ?', [id]);
      await this.dynamicConnection.query('UPDATE transactions SET is_deleted = 1 WHERE hos_transaction_id = ? and Hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.PAYMENT_WITH_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
        },
      ];

    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async removeComponentIssue(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {

      await this.connection.query('DELETE FROM blood_issue WHERE id = ?', [id]);
      await this.connection.query('DELETE FROM transactions WHERE blood_issue_id = ?', [id]);

      const [GetDynComponentIssue] = await this.dynamicConnection.query(
        'SELECT id FROM blood_issue WHERE hos_blood_issue_id=? and hospital_id=?',
        [id, hospital_id]
      );

      const GetDynComponentissueID = GetDynComponentIssue.id;


      await this.dynamicConnection.query('DELETE FROM blood_issue WHERE id = ?', [GetDynComponentissueID]);
      await this.dynamicConnection.query('UPDATE transactions SET is_deleted = 1 WHERE blood_issue_id=?', [GetDynComponentissueID]);

      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.COMPONENT_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
        },
      ];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async removeonlycomponentissue(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM blood_issue WHERE id = ?', [id]);
      const [GetDynComponentIssue] = await this.dynamicConnection.query(
        'SELECT id FROM blood_issue WHERE hos_blood_issue_id=? and hospital_id=?',
        [id, hospital_id]
      );

      const GetDynComponentissueID = GetDynComponentIssue.id;

      await this.dynamicConnection.query('DELETE FROM blood_issue WHERE id = ?', [GetDynComponentissueID]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.COMPONENT_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
        },
      ];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}