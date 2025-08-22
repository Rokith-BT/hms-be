import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DischargePatientIpdModule } from './entities/discharge_patient_ipd_module.entity';
import {CountDto} from './dto/discharge_patient_ipd_module.dto';

@Injectable()
export class DischargePatientIpdModuleService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(DischargePatientIpdEntity: DischargePatientIpdModule) {
    try {
      switch (DischargePatientIpdEntity.discharge_status) {
        case 1: {
          const [staffId] = await this.connection.query(
            'SELECT email FROM staff WHERE id = ?',
            [DischargePatientIpdEntity.discharge_by],
          );
          if (!staffId || staffId.length === 0) {
            throw new Error(
              `${process.env.VALIDATION_STAFF} ${DischargePatientIpdEntity.discharge_by} ${process.env.VALIDATION_NOT_FOUND}`,
            );
          }
          const docemail = staffId.email;
          const caseeeid = await this.connection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const caseipdidd = caseeeid[0].case_reference_id;

          const dischargePatient = await this.connection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
    death_date,
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              caseipdidd,
              DischargePatientIpdEntity.opd_details_id,
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.discharge_by,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
            ],
          );
          const discharge_patient_death_id = dischargePatient.insertId;

          const Patientiddd = await this.connection.query(
            `SELECT patient_id from ipd_details WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const patientipdidd = Patientiddd[0].patient_id;

          const deathReport = await this.connection.query(
            `INSERT into death_report (
    patient_id,
    case_reference_id,
    attachment,
    attachment_name,
    death_date,
    guardian_name,
    death_report,
    is_active
  ) VALUES (?,?,?,?,?,?,?,?)`,
            [
              patientipdidd,
              caseipdidd,
              DischargePatientIpdEntity.attachment,
              DischargePatientIpdEntity.attachment_name,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.guardian_name,
              DischargePatientIpdEntity.death_report,
              DischargePatientIpdEntity.is_active,
            ],
          );
          const discharge_patient_death_report_id = deathReport.insertId;

          const getPatientbedhistory = await this.connection.query(
            'SELECT id FROM patient_bed_history WHERE case_reference_id = ?',
            [caseipdidd],
          );
          const patbedhistid = getPatientbedhistory[0].id;

          await this.connection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, patbedhistid],
          );
          await this.connection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const dischargebeddidd = await this.connection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const dischargeyourBedId = dischargebeddidd[0].bed;

          await this.connection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dischargeyourBedId],
          );

          const dynipddddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.Hospital_id,
            ],
          );
          const dynipddddidd = dynipddddid[0].id;

          const dyncaseeeid = await this.dynamicConnection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [dynipddddidd],
          );
          const dyncaseippdidd = dyncaseeeid[0].case_reference_id;

          const dynamicUpdateStaff = await this.dynamicConnection.query(
            'SELECT id FROM staff WHERE email = ?',
            [docemail],
          );
          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

          await this.dynamicConnection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
    death_date,
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note,
    Hospital_id,
    hospital_discharge_card_id
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dyncaseippdidd,
              DischargePatientIpdEntity.opd_details_id,
              dynipddddidd,
              dynamicUPTDStaffId,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              DischargePatientIpdEntity.Hospital_id,
              discharge_patient_death_id,
            ],
          );

          const dynPatientiddd = await this.dynamicConnection.query(
            `SELECT patient_id from ipd_details WHERE id = ?`,
            [dynipddddidd],
          );
          const dynpatientipdidd = dynPatientiddd[0].patient_id;

          await this.dynamicConnection.query(
            `INSERT into death_report (
    patient_id,
    case_reference_id,
    attachment,
    attachment_name,
    death_date,
    guardian_name,
    death_report,
    is_active,
    Hospital_id,
    hospital_death_report_id
  ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
              dynpatientipdidd,
              dyncaseippdidd,
              DischargePatientIpdEntity.attachment,
              DischargePatientIpdEntity.attachment_name,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.guardian_name,
              DischargePatientIpdEntity.death_report,
              DischargePatientIpdEntity.is_active,
              DischargePatientIpdEntity.Hospital_id,
              discharge_patient_death_report_id,
            ],
          );

          const getdynPatientbedhistory = await this.dynamicConnection.query(
            'SELECT id FROM patient_bed_history WHERE hospital_patient_bed_history_id = ? and Hospital_id = ?',
            [patbedhistid, DischargePatientIpdEntity.Hospital_id],
          );
          const dynnpatbedhistid = getdynPatientbedhistory[0].id;

          await this.dynamicConnection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, dynnpatbedhistid],
          );

          await this.dynamicConnection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynipddddidd],
          );

          const dyndischargebeddidd = await this.dynamicConnection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [dynipddddidd],
          );
          const dyndischargeyourBedId = dyndischargebeddidd[0].bed;

          await this.dynamicConnection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dyndischargeyourBedId],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_SUCCESS_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [discharge_patient_death_id],
                ),
              },
            },
          ];
        }
        case 2: {
          const [staffId] = await this.connection.query(
            'SELECT email FROM staff WHERE id = ?',
            [DischargePatientIpdEntity.discharge_by],
          );
          if (!staffId || staffId.length === 0) {
            throw new Error(
              `${process.env.VALIDATION_STAFF} ${DischargePatientIpdEntity.discharge_by} ${process.env.VALIDATION_NOT_FOUND}`,
            );
          }
          const docemail = staffId.email;

          const caseeeid = await this.connection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const caseipdidd = caseeeid[0].case_reference_id;
          const dischargePatient = await this.connection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
    refer_date,
    refer_to_hospital,
    reason_for_referral,
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              caseipdidd,
              DischargePatientIpdEntity.opd_details_id,
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.discharge_by,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.refer_date,
              DischargePatientIpdEntity.refer_to_hospital,
              DischargePatientIpdEntity.reason_for_referral,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
            ],
          );
          const discharge_patient_death_id = dischargePatient.insertId;

          const getPatientbedhistory = await this.connection.query(
            'SELECT id FROM patient_bed_history WHERE case_reference_id = ?',
            [caseipdidd],
          );
          const patbedhistid = getPatientbedhistory[0].id;

          await this.connection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, patbedhistid],
          );

          await this.connection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );

          const dischargebeddidd = await this.connection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const dischargeyourBedId = dischargebeddidd[0].bed;

          await this.connection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dischargeyourBedId],
          );

          const dynipddddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.Hospital_id,
            ],
          );
          const dynipddddidd = dynipddddid[0].id;

          const dyncaseeeid = await this.dynamicConnection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [dynipddddidd],
          );
          const dyncaseippdidd = dyncaseeeid[0].case_reference_id;

          const dynamicUpdateStaff = await this.dynamicConnection.query(
            'SELECT id FROM staff WHERE email = ?',
            [docemail],
          );

          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

          await this.dynamicConnection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
    refer_date,
    refer_to_hospital,
    reason_for_referral,
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note,
    Hospital_id,
    hospital_discharge_card_id
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dyncaseippdidd,
              DischargePatientIpdEntity.opd_details_id,
              dynipddddidd,
              dynamicUPTDStaffId,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.refer_date,
              DischargePatientIpdEntity.refer_to_hospital,
              DischargePatientIpdEntity.reason_for_referral,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              DischargePatientIpdEntity.Hospital_id,
              discharge_patient_death_id,
            ],
          );

          const getdynPatientbedhistory = await this.dynamicConnection.query(
            'SELECT id FROM patient_bed_history WHERE hospital_patient_bed_history_id = ? and Hospital_id = ?',
            [patbedhistid, DischargePatientIpdEntity.Hospital_id],
          );
          const dynnpatbedhistid = getdynPatientbedhistory[0].id;

          await this.dynamicConnection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, dynnpatbedhistid],
          );

          await this.dynamicConnection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynipddddidd],
          );

          const dyndischargebeddidd = await this.dynamicConnection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [dynipddddidd],
          );
          const dyndischargeyourBedId = dyndischargebeddidd[0].bed;

          await this.dynamicConnection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dyndischargeyourBedId],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_SUCCESS_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [discharge_patient_death_id],
                ),
              },
            },
          ];
        }
        case 3: {
          const [staffId] = await this.connection.query(
            'SELECT email FROM staff WHERE id = ?',
            [DischargePatientIpdEntity.discharge_by],
          );
          if (!staffId || staffId.length === 0) {
            throw new Error(
              `${process.env.VALIDATION_STAFF} ${DischargePatientIpdEntity.discharge_by} ${process.env.VALIDATION_NOT_FOUND}`,
            );
          }
          const docemail = staffId.email;

          const caseeeid = await this.connection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const caseipdidd = caseeeid[0].case_reference_id;

          const dischargePatient = await this.connection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
   
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
              caseipdidd,
              DischargePatientIpdEntity.opd_details_id,
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.discharge_by,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
            ],
          );

          const discharge_patient_death_id = dischargePatient.insertId;

          const getPatientbedhistory = await this.connection.query(
            'SELECT id FROM patient_bed_history WHERE case_reference_id = ?',
            [caseipdidd],
          );
          const patbedhistid = getPatientbedhistory[0].id;

          await this.connection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, patbedhistid],
          );

          await this.connection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const dischargebeddidd = await this.connection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [DischargePatientIpdEntity.ipd_details_id],
          );
          const dischargeyourBedId = dischargebeddidd[0].bed;

          await this.connection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dischargeyourBedId],
          );

          const dynipddddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [
              DischargePatientIpdEntity.ipd_details_id,
              DischargePatientIpdEntity.Hospital_id,
            ],
          );
          const dynipddddidd = dynipddddid[0].id;

          const dyncaseeeid = await this.dynamicConnection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [dynipddddidd],
          );
          const dyncaseippdidd = dyncaseeeid[0].case_reference_id;

          const dynamicUpdateStaff = await this.dynamicConnection.query(
            'SELECT id FROM staff WHERE email = ?',
            [docemail],
          );

          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;

          await this.dynamicConnection.query(
            `INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
    ipd_details_id,
    discharge_by,
    discharge_date,
    discharge_status,
    operation,
    diagnosis,
    investigations,
    treatment_home,
    note,
    Hospital_id,
    hospital_discharge_card_id
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dyncaseippdidd,
              DischargePatientIpdEntity.opd_details_id,
              dynipddddidd,
              dynamicUPTDStaffId,
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              DischargePatientIpdEntity.Hospital_id,
              discharge_patient_death_id,
            ],
          );

          const getdynPatientbedhistory = await this.dynamicConnection.query(
            'SELECT id FROM patient_bed_history WHERE hospital_patient_bed_history_id = ? and Hospital_id = ?',
            [patbedhistid, DischargePatientIpdEntity.Hospital_id],
          );
          const dynnpatbedhistid = getdynPatientbedhistory[0].id;

          await this.dynamicConnection.query(
            `
  UPDATE patient_bed_history 
  SET to_date = ?,
  is_active = 'no'
  WHERE id = ?`,
            [DischargePatientIpdEntity.discharge_date, dynnpatbedhistid],
          );

          await this.dynamicConnection.query(
            `
  UPDATE ipd_details 
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynipddddidd],
          );
          const dyndischargebeddidd = await this.dynamicConnection.query(
            'SELECT bed FROM ipd_details WHERE id = ?',
            [dynipddddidd],
          );
          const dyndischargeyourBedId = dyndischargebeddidd[0].bed;

          await this.dynamicConnection.query(
            `UPDATE bed 
   SET is_active = 'yes'
   WHERE id = ?`,
            [dyndischargeyourBedId],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_SUCCESS_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [discharge_patient_death_id],
                ),
              },
            },
          ];
        }
      }
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

  async findAll(): Promise<DischargePatientIpdModule[]> {
    const getDischargeIpdDetails = await this.connection
      .query(`SELECT ipd_details.id,patients.patient_name AS PatientName,patients.id AS PatientID,ipd_details.case_reference_id AS Case_ID,
    patients.gender AS Gender,patients.mobileno AS Phone,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    ipd_details.date AS AdmissionDate,discharge_card.discharge_date AS DischargedDate
    FROM ipd_details 
    LEFT JOIN patients ON ipd_details.patient_id = patients.id 
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN discharge_card ON discharge_card.ipd_details_id = ipd_details.id
    WHERE 
    ipd_details.discharged = 'yes'`);
    return getDischargeIpdDetails;
  }

  async update(
    id: number,
    DischargePatientIpdEntity: DischargePatientIpdModule,
  ) {
    try {
      switch (DischargePatientIpdEntity.discharge_status) {
        case 1: {
          const uptdiscardid = await this.connection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [id],
          );
          const UPDDiscardidd = uptdiscardid[0].id;

          await this.connection.query(
            `UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        death_date=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDiscardidd,
            ],
          );

          const caseeeid = await this.connection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [id],
          );
          const caseipdidd = caseeeid[0].case_reference_id;

          const uptdeathhhid = await this.connection.query(
            `SELECT id from death_report WHERE case_reference_id = ?`,
            [caseipdidd],
          );
          const UPtdeathidd = uptdeathhhid[0].id;

          await this.connection.query(
            `UPDATE death_report SET
        attachment=?,
        attachment_name=?,
        death_date=?,
        guardian_name=?,
        death_report=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.attachment,
              DischargePatientIpdEntity.attachment_name,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.guardian_name,
              DischargePatientIpdEntity.death_report,
              UPtdeathidd,
            ],
          );

          const uptdynipddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [id, DischargePatientIpdEntity.Hospital_id],
          );
          const UPDDynipdidd = uptdynipddid[0].id;
          const uptdyndiscardid = await this.dynamicConnection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [UPDDynipdidd],
          );
          const UPDDynDiscardidd = uptdyndiscardid[0].id;

          await this.dynamicConnection.query(
            `UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        death_date=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDynDiscardidd,
            ],
          );

          const dyncaseeeid = await this.dynamicConnection.query(
            `SELECT case_reference_id from ipd_details WHERE id = ?`,
            [UPDDynipdidd],
          );
          const dynncaseipdidd = dyncaseeeid[0].case_reference_id;

          const uptDyndeathhhid = await this.dynamicConnection.query(
            `SELECT id from death_report WHERE case_reference_id = ?`,
            [dynncaseipdidd],
          );
          const UPtDyndeathidd = uptDyndeathhhid[0].id;

          await this.dynamicConnection.query(
            `UPDATE death_report SET
        attachment=?,
        attachment_name=?,
        death_date=?,
        guardian_name=?,
        death_report=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.attachment,
              DischargePatientIpdEntity.attachment_name,
              DischargePatientIpdEntity.death_date,
              DischargePatientIpdEntity.guardian_name,
              DischargePatientIpdEntity.death_report,
              UPtDyndeathidd,
            ],
          );
          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_UPDATE_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [UPDDiscardidd],
                ),
              },
            },
          ];
        }

        case 2: {
          const uptdiscardid = await this.connection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [id],
          );
          const UPDDiscardidd = uptdiscardid[0].id;

          await this.connection.query(
            `UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        refer_date=?,
        refer_to_hospital=?,
        reason_for_referral=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.refer_date,
              DischargePatientIpdEntity.refer_to_hospital,
              DischargePatientIpdEntity.reason_for_referral,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDiscardidd,
            ],
          );
          const uptdynipddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [id, DischargePatientIpdEntity.Hospital_id],
          );
          const UPDDynipdidd = uptdynipddid[0].id;

          const uptdyndiscardid = await this.dynamicConnection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [UPDDynipdidd],
          );
          const UPDDynDiscardidd = uptdyndiscardid[0].id;

          await this.dynamicConnection.query(
            `UPDATE discharge_card SET
      discharge_date=?,
      discharge_status=?,
      refer_date=?,
      refer_to_hospital=?,
      reason_for_referral=?,
      operation=?,
      diagnosis=?,
      investigations=?,
      treatment_home=?,
      note=?
      WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.refer_date,
              DischargePatientIpdEntity.refer_to_hospital,
              DischargePatientIpdEntity.reason_for_referral,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDynDiscardidd,
            ],
          );
          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_UPDATE_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [UPDDiscardidd],
                ),
              },
            },
          ];
        }

        case 3: {
          const uptdiscardid = await this.connection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [id],
          );
          const UPDDiscardidd = uptdiscardid[0].id;
          await this.connection.query(
            `UPDATE discharge_card SET
          discharge_date=?,
          discharge_status=?,
          operation=?,
          diagnosis=?,
          investigations=?,
          treatment_home=?,
          note=?
          WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDiscardidd,
            ],
          );

          const uptdynipddid = await this.dynamicConnection.query(
            `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
            [id, DischargePatientIpdEntity.Hospital_id],
          );
          const UPDDynipdidd = uptdynipddid[0].id;

          const uptdyndiscardid = await this.dynamicConnection.query(
            `SELECT id from discharge_card WHERE ipd_details_id = ?`,
            [UPDDynipdidd],
          );
          const UPDDynDiscardidd = uptdyndiscardid[0].id;

          await this.dynamicConnection.query(
            `UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`,
            [
              DischargePatientIpdEntity.discharge_date,
              DischargePatientIpdEntity.discharge_status,
              DischargePatientIpdEntity.operation,
              DischargePatientIpdEntity.diagnosis,
              DischargePatientIpdEntity.investigations,
              DischargePatientIpdEntity.treatment_home,
              DischargePatientIpdEntity.note,
              UPDDynDiscardidd,
            ],
          );

          return [
            {
              'data ': {
                status: process.env.SUCCESS_STATUS,
                messege: process.env.DISCHARGE_UPDATE_MESSAGE,
                Discharge_patient_details: await this.connection.query(
                  'SELECT * FROM discharge_card WHERE id = ?',
                  [UPDDiscardidd],
                ),
              },
            },
          ];
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.DATA_NOT_FOUND
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findOne(id: string): Promise<DischargePatientIpdModule | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM ipd_details WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.VALIDATION_NOT_FOUND,
          message: `${process.env.VALIDATION_CHECK} ${id} ${process.env.VALIDATION_DUPLICATE_CHECK}`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const getIPDByID = await this.connection.query(
        `SELECT ipd_details.id,concat('IPDN',"",ipd_details.id) AS IPD_No,ipd_details.date as AdmissionDate,ipd_details.case_reference_id AS Case_ID,
  concat(patients.patient_name, "(",patients.id,")" ) AS patientName,patients.gender,patients.mobileno,
  CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS staffname,concat(bed.name,"-",bed_group.name,"-",floor.name) AS Bed_name,CONCAT(age, ' years, ', month, ' months, ', day, ' days') AS Age,
  ipd_details.credit_limit,
  ipd_prescription_basic.finding_description,
  ipd_details.known_allergies,
  ipd_details.symptoms
  FROM ipd_details 
  LEFT JOIN ipd_prescription_basic ON ipd_prescription_basic.ipd_id = ipd_details.id
  LEFT JOIN patients ON ipd_details.patient_id = patients.id 
  LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
  LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
  LEFT JOIN bed_group ON ipd_details.bed_group_id = bed_group.id
  LEFT JOIN bed ON ipd_details.bed = bed.id
  LEFT JOIN bed_type ON bed.bed_type_id = bed_type.id
  LEFT JOIN floor ON bed_group.floor = floor.id 
  WHERE 
  ipd_details.discharged = 'yes'
  AND ipd_details.id = ? `,
        [id],
      );

      if (getIPDByID.length === 1) {
        return getIPDByID;
      } else {
        return null;
      }
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


  async findIpdDischargePatientSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT ipd_details.id,patients.patient_name AS PatientName,patients.id AS PatientID,ipd_details.case_reference_id AS Case_ID,
    patients.gender AS Gender,patients.mobileno AS Phone,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    ipd_details.date AS AdmissionDate,discharge_card.discharge_date AS DischargedDate,
    discharge_card.id AS DischargeId,
    patient_charges.tax AS Tax,patient_charges.apply_charge AS NetAmount,patient_charges.amount AS Total
    FROM ipd_details 
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON ipd_details.id = patient_charges.ipd_id
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN discharge_card ON discharge_card.ipd_details_id = ipd_details.id
    WHERE 
    ipd_details.discharged = 'yes'`;

    let countQuery = `
      SELECT COUNT(ipd_details.id) AS total 
      FROM ipd_details 
      LEFT JOIN patients ON ipd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON ipd_details.id = patient_charges.ipd_id
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN discharge_card ON discharge_card.ipd_details_id = ipd_details.id
    WHERE 
    ipd_details.discharged = 'yes' `;

    if (search) {

      const condition = `
      and (patients.patient_name like ? or patients.id like ? or ipd_details.case_reference_id like ? or patients.gender like ? or patients.mobileno like ? or staff.name like ? or ipd_details.date like ? or discharge_card.discharge_date like ? or patient_charges.tax like ? or patient_charges.apply_charge like ? or patient_charges.amount like ?) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY discharge_card.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ipdDischargePatientSearchraw = await this.connection.query(baseQuery, paginatedValues);

    const ipdDischargePatientSearch = ipdDischargePatientSearchraw.map((item: any) => ({
      ...item,
      Tax: item.Tax != null ? parseFloat(item.Tax).toFixed(2) : '0.00',
      NetAmount: item.NetAmount != null ? parseFloat(item.NetAmount).toFixed(2) : '0.00',
      Total: item.Total != null ? parseFloat(item.Total).toFixed(2) : '0.00',
    }));

    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ipdDischargePatientSearch,
      total: countResult.total ?? 0,
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


  async findIpdDischargePatientsSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT ipd_details.id,patients.patient_name AS PatientName,patients.id AS PatientID,ipd_details.case_reference_id AS Case_ID,
    patients.gender AS Gender,patients.mobileno AS Phone,
    CONCAT(staff.name, ' ', staff.surname,"(",staff.employee_id,")") AS Consultant,
    ipd_details.date AS AdmissionDate,discharge_card.discharge_date AS DischargedDate,
    discharge_card.id AS DischargeId,
    patient_charges.tax AS Tax,patient_charges.apply_charge AS NetAmount,patient_charges.amount AS Total
    FROM ipd_details 
    LEFT JOIN patients ON ipd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON ipd_details.id = patient_charges.ipd_id
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN discharge_card ON discharge_card.ipd_details_id = ipd_details.id
    WHERE 
    ipd_details.discharged = 'yes'`;

    let countQuery = `
      SELECT COUNT(ipd_details.id) AS total 
      FROM ipd_details 
      LEFT JOIN patients ON ipd_details.patient_id = patients.id
    LEFT JOIN patient_charges ON ipd_details.id = patient_charges.ipd_id
    LEFT JOIN staff ON ipd_details.cons_doctor = staff.id 
    LEFT JOIN case_references ON ipd_details.case_reference_id = case_references.id 
    LEFT JOIN discharge_card ON discharge_card.ipd_details_id = ipd_details.id
    WHERE 
    ipd_details.discharged = 'yes' `;

    if (search) {

      const condition = `
      and (patients.patient_name like ? or patients.id like ? or ipd_details.case_reference_id like ? or patients.gender like ? or patients.mobileno like ? or staff.name like ? or ipd_details.date like ? or discharge_card.discharge_date like ? or patient_charges.tax like ? or patient_charges.apply_charge like ? or patient_charges.amount like ?) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY discharge_card.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ipdDischargePatientSearchraw = await this.connection.query(baseQuery, paginatedValues);

    const ipdDischargePatientSearch = ipdDischargePatientSearchraw.map((item: any) => ({
      ...item,
      Tax: item.Tax != null ? parseFloat(item.Tax).toFixed(2) : '0.00',
      NetAmount: item.NetAmount != null ? parseFloat(item.NetAmount).toFixed(2) : '0.00',
      Total: item.Total != null ? parseFloat(item.Total).toFixed(2) : '0.00',
    }));

    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ipdDischargePatientSearch,
      total: countResult.total ?? 0,
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
