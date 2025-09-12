import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OpdBilling, OpdBillingV3 } from './entities/opd_billing.entity';
import { FaceAuthService } from 'src/face-auth/face-auth.service';

@Injectable()
export class OpdBillingService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
    @Inject(forwardRef(() => FaceAuthService))
    private readonly addAppointmentService: FaceAuthService,
  ) {}

  async create(opd_entity: OpdBilling) {
    try {
      const HOSpatient = await this.connection.query(
        'select * from patients where id =?',
        [opd_entity.patient_id],
      );
      const patientInHos = await this.dynamicConnection.query(
        'select patients.id from patients where aayush_unique_id = ?',
        [HOSpatient[0].aayush_unique_id],
      );
      let HOSpatientId;
      if (patientInHos[0]) {
        HOSpatientId = patientInHos[0].id;
      } else {
        let faceID = null;
        if (HOSpatient[0].image && HOSpatient[0].image.trim() != '') {
          const getFaceId = await this.addAppointmentService.getfaceID(
            HOSpatient[0].image,
          );
          faceID = getFaceId?.faceID;
        }
        const createpatient = await this.dynamicConnection.query(
          `insert into patients  (
    patient_name,
    dob,
    image,
    faceId,
    mobileno,
    email,
    gender,
    address,
    ABHA_number
    )
    values(?,?,?,?,?,?,?,?,?)`,
          [
            HOSpatient[0].patient_name,
            HOSpatient[0].dob,
            HOSpatient[0].image,
            faceID,
            HOSpatient[0].mobile_no,
            HOSpatient[0].email,
            HOSpatient[0].gender,
            HOSpatient[0].address,
            HOSpatient[0].ABHA_number,
          ],
        );
        HOSpatientId = createpatient.insertId;
      }
      const [staffEmailInHOS] = await this.connection.query(
        `select email from staff where id = ?`,
        [opd_entity.cons_doctor],
      );
      const [adminStaff] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [staffEmailInHOS.email],
      );
      let adminStaffId = adminStaff.id;

      let HOStransaction_id: number;
      const HOScaseRef = await this.connection.query(
        'INSERT INTO case_references () values(default,default)',
      );
      const HOSopdCreate = await this.connection.query(
        `
insert into opd_details (case_reference_id,patient_id) values (?,?)`,
        [HOScaseRef.insertId, opd_entity.patient_id],
      );
      const HOSopdccreate = HOSopdCreate.insertId;
      const HOSamount = await this.connection.query(
        `
select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
  (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
charges join tax_category on charges.tax_category_id = tax_category.id
where charges.id = ?`,
        [opd_entity.charge_id],
      );
      let HOspatient_charges_id;
      const HOSPatient_charges = await this.connection.query(
        `insert into patient_charges(
    date,
    opd_id,
    qty,
    charge_id,
    standard_charge, 
    tax,
    apply_charge,
    amount,
    transaction_id
    ) values(?,?,?,?,?,?,?,?,?)`,
        [
          opd_entity.date,
          HOSopdccreate,
          1,
          opd_entity.charge_id,
          HOSamount[0].standard_charge,
          HOSamount[0].tax_percentage,
          opd_entity.apply_charge,
          HOSamount[0].amount,
          HOStransaction_id,
        ],
      );
      HOspatient_charges_id = HOSPatient_charges.insertId;
      const HOStransactions = await this.connection.query(
        `
insert into transactions (
  type,
  opd_id,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date
  ) values
  (?,?,?,?,?,?,?,?)`,
        [
          'payment',
          HOSopdCreate.insertId,
          'OPD',
          opd_entity.patient_id,
          HOScaseRef.insertId,
          HOSamount.amount,
          opd_entity.payment_mode,
          opd_entity.payment_date,
        ],
      );
      HOStransaction_id = HOStransactions.insertId;
      await this.connection.query(
        `update patient_charges SET transaction_id = ? where id = ?`,
        [HOStransactions.insertId, HOSPatient_charges.insertId],
      );
      const HOSvisitInsert = await this.connection.query(
        `
  insert into visit_details(
    opd_details_id,
    organisation_id,
    patient_charge_id,
    transaction_id,
    case_type,
    cons_doctor,
    appointment_date,
    live_consult,
    payment_mode,
    note
    ) values (?,?,?,?,?,?,?,?,?,?)`,
        [
          HOSopdCreate.insertId,
          opd_entity.organisation_id,
          HOspatient_charges_id,
          HOStransaction_id,
          '',
          opd_entity.cons_doctor,
          opd_entity.date + ' ' + opd_entity.time,
          opd_entity.live_consult,
          opd_entity.payment_mode,
          opd_entity.note,
        ],
      );

      // ##################################################################################################################################################################
      const caseRef = await this.dynamicConnection.query(
        'INSERT INTO case_references values(default,default)',
      );
      const opdCreate = await this.dynamicConnection.query(
        `
  insert into opd_details (case_reference_id,patient_id,Hospital_id,hos_opd_id) values (?,?,?,?)`,
        [
          caseRef.insertId,
          HOSpatientId,
          opd_entity.Hospital_id,
          HOSopdCreate.insertId,
        ],
      );
      let insertOPDID = opdCreate.insertId;
      const [getAdminChargeId] = await this.dynamicConnection.query(
        `select id  from charges 
where Hospital_id = ? and hospital_charges_id = ?`,
        [opd_entity.Hospital_id, opd_entity.charge_id],
      );
      const Patient_charges = await this.dynamicConnection.query(
        `insert into patient_charges(
    date,
    opd_id,
    qty,
    charge_id,
    standard_charge, 
    tax,
    apply_charge,
    amount,Hospital_id,hos_patient_charges_id
    ) values(?,?,?,?,?,?,?,?,?,?)`,
        [
          opd_entity.date,
          insertOPDID,
          1,
          getAdminChargeId.id,
          HOSamount[0].standard_charge,
          HOSamount[0].tax_percentage,
          opd_entity.apply_charge,
          HOSamount[0].amount,
          opd_entity.Hospital_id,
          HOSPatient_charges.insertId,
        ],
      );
      const adminpatient_charges_id = Patient_charges.insertId;
      let adminTransaction_id;
      try {
        const transactions = await this.dynamicConnection.query(
          `
  insert into transactions (
  type,
  opd_id,
  section,
  patient_id,
  case_reference_id,
  amount,
  payment_mode,
  payment_date,Hospital_id,
  hos_transaction_id
  ) values
  (?,?,?,?,?,?,?,?,?,?)`,
          [
            'payment',
            insertOPDID,
            'OPD',
            HOSpatientId,
            caseRef.insertId,
            HOSamount.amount,
            opd_entity.payment_mode,
            opd_entity.payment_date,
            opd_entity.Hospital_id,
            HOStransactions.insertId,
          ],
        );
        adminTransaction_id = transactions.insertId;
        await this.dynamicConnection.query(
          `update patient_charges SET transaction_id = ? where id = ?`,
          [transactions.insertId, Patient_charges.insertId],
        );
      } catch (error) {
        console.log(error);
        return 'error in admin transaction insert';
      }
      const [organisation_id] = await this.dynamicConnection.query(
        `select id from organisation 
where Hospital_id = ? and hos_organisation_id = ?`,
        [opd_entity.Hospital_id, opd_entity.organisation_id],
      );
      await this.dynamicConnection.query(
        `
  insert into visit_details(
    opd_details_id,
    organisation_id,
    patient_charge_id,
    transaction_id,
    case_type,
    cons_doctor,
    appointment_date,
    live_consult,
    payment_mode,
    note,
    Hospital_id,
    hos_visit_id
  ) values (?,?,?,?,?,?,?,?,?,?,?,?)`,

        [
          opdCreate.insertId,
          organisation_id.id,
          adminpatient_charges_id,
          adminTransaction_id,
          '',
          adminStaffId,
          opd_entity.date + ' ' + opd_entity.time,
          opd_entity.live_consult,
          opd_entity.payment_mode,
          opd_entity.note,
          opd_entity.Hospital_id,
          HOSvisitInsert.insertId,
        ],
      );
      return [
        {
          status: 'success',
          message: 'opd billing details added successfully',
          'inserted_details ': await this.connection.query(
            'select * from opd_details where id = ?',
            [HOSopdCreate.insertId],
          ),
        },
      ];
    } catch (error) {
      return error;
    }
  }

  async AddOPDPayment(opd_entity: OpdBilling) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [opd_entity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${opd_entity.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [opd_entity.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${opd_entity.received_by} not found.`);
      }
      const docemail = staffId.email;
      let opd_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       opd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
        payment_gateway,
       payment_id,
       payment_reference_number,
       received_by
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'OPD',
          opd_entity.patient_id,
          opd_entity.case_reference_id,
          opd_entity.opd_id,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          opd_entity.received_by,
        ],
      );
      opd_transaction_id = Pharmacy_transaction.insertId;
      // -------------------------------------//
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getpharmabillBasic = await this.dynamicConnection.query(
        'SELECT id FROM opd_details WHERE hos_opd_id = ? and Hospital_id =?',
        [opd_entity.opd_id, opd_entity.Hospital_id],
      );
      const getpharmabillBasicID = getpharmabillBasic[0].id;
      const DynCaseref = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [getpharmabillBasicID],
      );
      const DynCaserefID = DynCaseref[0].case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       opd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
        payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
       Hospital_id,
       hos_transaction_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'OPD',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          dynamicUPTDStaffId,
          opd_entity.Hospital_id,
          opd_transaction_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'OPD Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [opd_transaction_id],
            ),
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
  async AddIPDPayment(opd_entity: OpdBilling) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [opd_entity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${opd_entity.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [opd_entity.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${opd_entity.received_by} not found.`);
      }
      const docemail = staffId.email;
      let ipd_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       ipd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       payment_gateway,
       payment_id,
       payment_reference_number,
       received_by
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'IPD',
          opd_entity.patient_id,
          opd_entity.case_reference_id,
          opd_entity.ipd_id,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          opd_entity.received_by,
        ],
      );

      ipd_transaction_id = Pharmacy_transaction.insertId;

      // -------------------------------------//
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getpharmabillBasic = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ? and hospital_id =?',
        [opd_entity.ipd_id, opd_entity.Hospital_id],
      );
      const getpharmabillBasicID = getpharmabillBasic[0].id;
      const DynCaseref = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [getpharmabillBasicID],
      );
      const DynCaserefID = DynCaseref[0].case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       ipd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
       Hospital_id,
       hos_transaction_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'IPD',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          dynamicUPTDStaffId,
          opd_entity.Hospital_id,
          ipd_transaction_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'IPD Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [ipd_transaction_id],
            ),
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async AddOPDPaymentV3(opd_entity: OpdBillingV3) {
    try {
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
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [opd_entity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${opd_entity.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [opd_entity.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${opd_entity.received_by} not found.`);
      }
      const docemail = staffId.email;
      let opd_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       opd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
        payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
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
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'OPD',
          opd_entity.patient_id,
          opd_entity.case_reference_id,
          opd_entity.opd_id,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          opd_entity.received_by,
          opd_entity.payment_method,
          opd_entity.card_division,
          opd_entity.card_type,
          opd_entity.card_transaction_id,
          opd_entity.card_bank_name,
          opd_entity.net_banking_division,
          opd_entity.net_banking_transaction_id,
          opd_entity.upi_id,
          opd_entity.upi_bank_name,
          opd_entity.upi_transaction_id,
        ],
      );
      opd_transaction_id = Pharmacy_transaction.insertId;
      // -------------------------------------//
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getpharmabillBasic = await this.dynamicConnection.query(
        'SELECT id FROM opd_details WHERE hos_opd_id = ? and Hospital_id =?',
        [opd_entity.opd_id, opd_entity.Hospital_id],
      );
      const getpharmabillBasicID = getpharmabillBasic[0].id;
      const DynCaseref = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [getpharmabillBasicID],
      );
      const DynCaserefID = DynCaseref[0].case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       opd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
        payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
       Hospital_id,
       hos_transaction_id,
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
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'OPD',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          dynamicUPTDStaffId,
          opd_entity.Hospital_id,
          opd_transaction_id,
          opd_entity.payment_method,
          opd_entity.card_division,
          opd_entity.card_type,
          opd_entity.card_transaction_id,
          opd_entity.card_bank_name,
          opd_entity.net_banking_division,
          opd_entity.net_banking_transaction_id,
          opd_entity.upi_id,
          opd_entity.upi_bank_name,
          opd_entity.upi_transaction_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'OPD Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [opd_transaction_id],
            ),
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
  async AddIPDPaymentV3(opd_entity: OpdBillingV3) {
    try {
      const [patientId] = await this.connection.query(
        'SELECT aayush_unique_id FROM patients WHERE id = ?',
        [opd_entity.patient_id],
      );
      if (!patientId || patientId.length === 0) {
        throw new Error(` with id: ${opd_entity.patient_id} not found.`);
      }
      const email = patientId.aayush_unique_id;
      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [opd_entity.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(`Staff with id: ${opd_entity.received_by} not found.`);
      }
      const docemail = staffId.email;
      let ipd_transaction_id;
      const Pharmacy_transaction = await this.connection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       ipd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
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
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'IPD',
          opd_entity.patient_id,
          opd_entity.case_reference_id,
          opd_entity.ipd_id,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          opd_entity.received_by,
          opd_entity.payment_method,
          opd_entity.card_division,
          opd_entity.card_type,
          opd_entity.card_transaction_id,
          opd_entity.card_bank_name,
          opd_entity.net_banking_division,
          opd_entity.net_banking_transaction_id,
          opd_entity.upi_id,
          opd_entity.upi_bank_name,
          opd_entity.upi_transaction_id,
        ],
      );

      ipd_transaction_id = Pharmacy_transaction.insertId;

      // -------------------------------------//
      const dynamicPatient = await this.dynamicConnection.query(
        'SELECT id FROM patients WHERE aayush_unique_id = ?',
        [email],
      );
      const dynamicIPDPatientId = dynamicPatient[0].id;
      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const getpharmabillBasic = await this.dynamicConnection.query(
        'SELECT id FROM ipd_details WHERE hospital_ipd_details_id = ? and hospital_id =?',
        [opd_entity.ipd_id, opd_entity.Hospital_id],
      );
      const getpharmabillBasicID = getpharmabillBasic[0].id;
      const DynCaseref = await this.dynamicConnection.query(
        'SELECT case_reference_id FROM opd_details WHERE id = ?',
        [getpharmabillBasicID],
      );
      const DynCaserefID = DynCaseref[0].case_reference_id;
      await this.dynamicConnection.query(
        `INSERT into transactions (
       type,
       section,
       patient_id,
       case_reference_id,
       ipd_id,
       payment_mode,
       amount,
       cheque_no,
       cheque_date,
       attachment,
       attachment_name,
       payment_date,
       note,
       payment_gateway,
       payment_id,
       payment_reference_number,
       received_by,
       Hospital_id,
       hos_transaction_id,
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
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'IPD',
          dynamicIPDPatientId,
          DynCaserefID,
          getpharmabillBasicID,
          opd_entity.payment_mode,
          opd_entity.amount,
          opd_entity.cheque_no,
          opd_entity.cheque_date,
          opd_entity.attachment,
          opd_entity.attachment_name,
          opd_entity.payment_date,
          opd_entity.note,
          opd_entity.payment_gateway,
          opd_entity.payment_id,
          opd_entity.payment_reference_number,
          dynamicUPTDStaffId,
          opd_entity.Hospital_id,
          ipd_transaction_id,
          opd_entity.payment_method,
          opd_entity.card_division,
          opd_entity.card_type,
          opd_entity.card_transaction_id,
          opd_entity.card_bank_name,
          opd_entity.net_banking_division,
          opd_entity.net_banking_transaction_id,
          opd_entity.upi_id,
          opd_entity.upi_bank_name,
          opd_entity.upi_transaction_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'IPD Payment bill details added successfully ',
            Added_Payment_values: await this.connection.query(
              'SELECT * FROM transactions where id = ?',
              [ipd_transaction_id],
            ),
          },
        },
      ];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
}
