


import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {  InjectDataSource } from '@nestjs/typeorm';
import {  DataSource } from 'typeorm';
import { DischargePatientOpdModule } from './entities/discharge_patient_opd_module.entity';

@Injectable()
export class DischargePatientOpdModuleService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(DischargePatientOpdModule: DischargePatientOpdModule) {
    try {
      switch (DischargePatientOpdModule.discharge_status) {
        case 1: {

          const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [DischargePatientOpdModule.discharge_by]);
          if (!staffId || staffId.length === 0) {
            throw new Error(`Staff with id: ${DischargePatientOpdModule.discharge_by} not found.`);
          }
          const docemail = staffId.email;
          const caseeeid = await this.connection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [DischargePatientOpdModule.opd_details_id])
          const caseipdidd = caseeeid[0].case_reference_id;

          const dischargePatient = await this.connection.query(`INSERT into discharge_card (
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
              DischargePatientOpdModule.opd_details_id,
              DischargePatientOpdModule.ipd_details_id,
              DischargePatientOpdModule.discharge_by,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note
            ],
          );
          const discharge_patient_death_id = dischargePatient.insertId;

          const Patientiddd = await this.connection.query(`SELECT patient_id from opd_details WHERE id = ?`, [DischargePatientOpdModule.opd_details_id])
          const patientopdid = Patientiddd[0].patient_id;

          const gaurdiannn = await this.connection.query(`SELECT guardian_name from patients WHERE id = ?`, [patientopdid])
          const gaurdianname = gaurdiannn[0].guardian_name;

          const deathReport = await this.connection.query(`INSERT into death_report (
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
              patientopdid,
              caseipdidd,
              DischargePatientOpdModule.attachment,
              DischargePatientOpdModule.attachment_name,
              DischargePatientOpdModule.death_date,
              gaurdianname,
              DischargePatientOpdModule.death_report,
              DischargePatientOpdModule.is_active
            ],
          );

          const discharge_patient_death_report_id = deathReport.insertId;

          await this.connection.query(`
  UPDATE opd_details
  SET discharged = 'yes'
  WHERE id = ?`,
            [DischargePatientOpdModule.opd_details_id]
          );

          //------------------------------------------------------------------------------//

          const dynipddddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and Hospital_id = ?`, [DischargePatientOpdModule.opd_details_id, DischargePatientOpdModule.Hospital_id])
          const dynipddddidd = dynipddddid[0].id;

          const dyncaseeeid = await this.dynamicConnection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [dynipddddidd])
          const dyncaseippdidd = dyncaseeeid[0].case_reference_id;

          const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);

          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;


          await this.dynamicConnection.query(`INSERT into discharge_card (
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
              dynipddddidd,
              DischargePatientOpdModule.ipd_details_id,
              dynamicUPTDStaffId,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              DischargePatientOpdModule.Hospital_id,
              discharge_patient_death_id
            ],
          );

          const dynPatientiddd = await this.dynamicConnection.query(`SELECT patient_id from opd_details WHERE id = ?`, [dynipddddidd])
          const dynpatientipdidd = dynPatientiddd[0].patient_id;

          const dyngaurdiannn = await this.dynamicConnection.query(`SELECT guardian_name from patients WHERE id = ?`, [dynpatientipdidd])
          const dyngaurdianname = dyngaurdiannn[0].guardian_name;
          await this.dynamicConnection.query(`INSERT into death_report (
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
              DischargePatientOpdModule.attachment,
              DischargePatientOpdModule.attachment_name,
              DischargePatientOpdModule.death_date,
              dyngaurdianname,
              DischargePatientOpdModule.death_report,
              DischargePatientOpdModule.is_active,
              DischargePatientOpdModule.Hospital_id,
              discharge_patient_death_report_id
            ],
          );
          await this.dynamicConnection.query(`
  UPDATE opd_details
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynipddddidd]
          );

          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [discharge_patient_death_id])
            }
          }];

        }
        case 2: {
          const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [DischargePatientOpdModule.discharge_by]);
          if (!staffId || staffId.length === 0) {
            throw new Error(`Staff with id: ${DischargePatientOpdModule.discharge_by} not found.`);
          }
          const docemail = staffId.email;

          const caseeeid = await this.connection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [DischargePatientOpdModule.opd_details_id])
          const caseipdidd = caseeeid[0].case_reference_id;
          const dischargePatient = await this.connection.query(`INSERT into discharge_card (
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
              DischargePatientOpdModule.opd_details_id,
              DischargePatientOpdModule.ipd_details_id,
              DischargePatientOpdModule.discharge_by,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.refer_date,
              DischargePatientOpdModule.refer_to_hospital,
              DischargePatientOpdModule.reason_for_referral,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note
            ],
          );
          const discharge_patient_death_id = dischargePatient.insertId;

          await this.connection.query(`
  UPDATE opd_details
  SET discharged = 'yes'
  WHERE id = ?`,
            [DischargePatientOpdModule.ipd_details_id]
          );

          const dynipddddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and hospital_id = ?`, [DischargePatientOpdModule.opd_details_id, DischargePatientOpdModule.Hospital_id])
          const dynipddddidd = dynipddddid[0].id;


          const dyncaseeeid = await this.dynamicConnection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [dynipddddidd])
          const dyncaseippdidd = dyncaseeeid[0].case_reference_id;
          const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
          await this.dynamicConnection.query(`INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
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
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dyncaseippdidd,
              dynipddddidd,
              dynamicUPTDStaffId,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.refer_date,
              DischargePatientOpdModule.refer_to_hospital,
              DischargePatientOpdModule.reason_for_referral,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              DischargePatientOpdModule.Hospital_id,
              discharge_patient_death_id
            ],
          );
          await this.dynamicConnection.query(`
  UPDATE opd_details
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynipddddidd]
          );
          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [discharge_patient_death_id])
            }
          }];
        }
        case 3: {
          const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [DischargePatientOpdModule.discharge_by]);
          if (!staffId || staffId.length === 0) {
            throw new Error(`Staff with id: ${DischargePatientOpdModule.discharge_by} not found.`);
          }
          const docemail = staffId.email;

          const caseeeid = await this.connection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [DischargePatientOpdModule.opd_details_id])
          const caseopdidd = caseeeid[0].case_reference_id;

          const dischargePatient = await this.connection.query(`INSERT into discharge_card (
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
              caseopdidd,
              DischargePatientOpdModule.opd_details_id,
              DischargePatientOpdModule.ipd_details_id,
              DischargePatientOpdModule.discharge_by,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note
            ],
          );

          const discharge_patient_death_id = dischargePatient.insertId;
          const dynopddddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and hospital_id = ?`, [DischargePatientOpdModule.opd_details_id, DischargePatientOpdModule.Hospital_id])
          const dynopddddidd = dynopddddid[0].id;


          const dyncaseeeid = await this.dynamicConnection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [dynopddddidd])
          const dyncaseoppdidd = dyncaseeeid[0].case_reference_id;

          const dynamicUpdateStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
          const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
          await this.dynamicConnection.query(`INSERT into discharge_card (
    case_reference_id,
    opd_details_id,
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
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              dyncaseoppdidd,
              // DischargePatientOpdModule.opd_details_id,
              dynopddddidd,
              dynamicUPTDStaffId,
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              DischargePatientOpdModule.Hospital_id,
              discharge_patient_death_id
            ],
          );

          await this.dynamicConnection.query(`
  UPDATE opd_details
  SET discharged = 'yes'
  WHERE id = ?`,
            [dynopddddidd]
          );


          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [discharge_patient_death_id])
            }
          }];


        }
      }
    } catch (error) {

  throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:  process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


async findAll(limit: number, page: number): Promise<{ data: DischargePatientOpdModule[]; total: number }> {
  try {
    const offset = (page - 1) * limit;

    const data = await this.connection.query(`
      SELECT 
        p.patient_name AS PatientName,
        p.id AS PatientID,
        od.case_reference_id AS Case_ID,
        p.gender AS Gender,
        p.mobileno AS Phone,
        CONCAT(s.name, ' ', s.surname, '(', s.employee_id, ')') AS Consultant,
        dc.discharge_date AS DischargedDate
      FROM opd_details od
      LEFT JOIN patients p ON od.patient_id = p.id
      LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
      LEFT JOIN staff s ON vd.cons_doctor = s.id
      LEFT JOIN discharge_card dc ON dc.opd_details_id = od.id
      WHERE od.discharged = 'yes'
      ORDER BY dc.discharge_date DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalResult = await this.connection.query(`
      SELECT COUNT(*) AS total
      FROM opd_details od
      LEFT JOIN patients p ON od.patient_id = p.id
      LEFT JOIN visit_details vd ON vd.opd_details_id = od.id
      LEFT JOIN staff s ON vd.cons_doctor = s.id
      LEFT JOIN discharge_card dc ON dc.opd_details_id = od.id
      WHERE od.discharged = 'yes'
    `);
    
    const total = totalResult[0]?.total || 0;

    return { data, total };
  } catch (error) {
    throw new HttpException({
      statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  async update(id: number, DischargePatientOpdModule: DischargePatientOpdModule) {

    try {
      switch (DischargePatientOpdModule.discharge_status) {
        case 1: {

          const uptdiscardid = await this.connection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [id])
          const UPDDiscardidd = uptdiscardid[0].id;

          await this.connection.query(`UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        death_date=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`
            ,
            [
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDiscardidd
            ],
          )

          const caseeeid = await this.connection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [id])
          const caseipdidd = caseeeid[0].case_reference_id;

          const uptdeathhhid = await this.connection.query(`SELECT id from death_report WHERE case_reference_id = ?`, [caseipdidd])
          const UPtdeathidd = uptdeathhhid[0].id;

          await this.connection.query(`UPDATE death_report SET
        attachment=?,
        attachment_name=?,
        death_date=?,
        guardian_name=?,
        death_report=?
        WHERE id = ?`,
            [
              DischargePatientOpdModule.attachment,
              DischargePatientOpdModule.attachment_name,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.guardian_name,
              DischargePatientOpdModule.death_report,
              UPtdeathidd
            ],
          )


          const uptdynipddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and Hospital_id = ?`, [id, DischargePatientOpdModule.Hospital_id])
          const UPDDynipdidd = uptdynipddid[0].id;

          const uptdyndiscardid = await this.dynamicConnection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [UPDDynipdidd])
          const UPDDynDiscardidd = uptdyndiscardid[0].id;



          await this.dynamicConnection.query(`UPDATE discharge_card SET
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
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDynDiscardidd
            ],
          )


          const dyncaseeeid = await this.dynamicConnection.query(`SELECT case_reference_id from opd_details WHERE id = ?`, [UPDDynipdidd])
          const dynncaseipdidd = dyncaseeeid[0].case_reference_id;

          const uptDyndeathhhid = await this.dynamicConnection.query(`SELECT id from death_report WHERE case_reference_id = ?`, [dynncaseipdidd])
          const UPtDyndeathidd = uptDyndeathhhid[0].id;

          await this.dynamicConnection.query(`UPDATE death_report SET
        attachment=?,
        attachment_name=?,
        death_date=?,
        guardian_name=?,
        death_report=?
        WHERE id = ?`,
            [
              DischargePatientOpdModule.attachment,
              DischargePatientOpdModule.attachment_name,
              DischargePatientOpdModule.death_date,
              DischargePatientOpdModule.guardian_name,
              DischargePatientOpdModule.death_report,
              UPtDyndeathidd
            ],
          )
          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS_UPDATED,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [UPDDiscardidd])
            }
          }];

        }
        case 2: {

          const uptdiscardid = await this.connection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [id])
          const UPDDiscardidd = uptdiscardid[0].id;
          await this.connection.query(`UPDATE discharge_card SET
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
        WHERE id = ?`
            ,
            [
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.refer_date,
              DischargePatientOpdModule.refer_to_hospital,
              DischargePatientOpdModule.reason_for_referral,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDiscardidd
            ],
          )


          const uptdynipddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE opd_details = ? and Hospital_id = ?`, [id, DischargePatientOpdModule.Hospital_id])
          const UPDDynipdidd = uptdynipddid[0].id;



          const uptdyndiscardid = await this.dynamicConnection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [UPDDynipdidd])
          const UPDDynDiscardidd = uptdyndiscardid[0].id;

          await this.dynamicConnection.query(`UPDATE discharge_card SET
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
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.refer_date,
              DischargePatientOpdModule.refer_to_hospital,
              DischargePatientOpdModule.reason_for_referral,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDynDiscardidd
            ],
          )

          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS_UPDATED,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [UPDDiscardidd])
            }
          }];

        }

        case 3: {
          const uptdiscardid = await this.connection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [id])
          const UPDDiscardidd = uptdiscardid[0].id;

          await this.connection.query(`UPDATE discharge_card SET
          discharge_date=?,
          discharge_status=?,
          operation=?,
          diagnosis=?,
          investigations=?,
          treatment_home=?,
          note=?
          WHERE id = ?`
            ,
            [
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDiscardidd
            ],
          )

          const uptdynipddid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and Hospital_id = ?`, [id, DischargePatientOpdModule.Hospital_id])
          const UPDDynipdidd = uptdynipddid[0].id;

          const uptdyndiscardid = await this.dynamicConnection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [UPDDynipdidd])
          const UPDDynDiscardidd = uptdyndiscardid[0].id;


          await this.dynamicConnection.query(`UPDATE discharge_card SET
        discharge_date=?,
        discharge_status=?,
        operation=?,
        diagnosis=?,
        investigations=?,
        treatment_home=?,
        note=?
        WHERE id = ?`,
            [
              DischargePatientOpdModule.discharge_date,
              DischargePatientOpdModule.discharge_status,
              DischargePatientOpdModule.operation,
              DischargePatientOpdModule.diagnosis,
              DischargePatientOpdModule.investigations,
              DischargePatientOpdModule.treatment_home,
              DischargePatientOpdModule.note,
              UPDDynDiscardidd
            ],
          )

          return [{
            "data ": {
              status: process.env.SUCCESS_STATUS_V2,
              "messege": process.env.DISCHARGED_STATUS_UPDATED,
              "Discharge_patient_details": await this.connection.query('SELECT * FROM discharge_card WHERE id = ?', [UPDDiscardidd])
            }
          }];
        }
      }

    } catch (error) {
   throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
}