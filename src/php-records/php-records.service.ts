import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PhpDeathRecord, PhpBirthRecord } from "./entities/php-record.entity";


@Injectable()
export class PhpRecordsService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async createDeath(createPhpRecordDto: PhpDeathRecord) {
    try {
      const [getPatUniqueId] = await this.connection.query(`select * from patients where id = ?`, [createPhpRecordDto.patient_id])
      const [getAdminPatientId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatUniqueId.aayush_unique_id])
      const [getIpdId] = await this.connection.query(`select * from ipd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      const [getOpdId] = await this.connection.query(`select * from opd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      let adminCaseRefId;
      if (getIpdId) {
        const [getAdminCaseFromIpd] = await this.dynamicConnection.query(`select * from ipd_details where hospital_id = ? and 
          hospital_ipd_details_id = ?`, [
          createPhpRecordDto.hospital_id,
          getIpdId.id
        ])
        adminCaseRefId = getAdminCaseFromIpd.case_reference_id
      }
      if (getOpdId) {
        const [getAdminCaseFromOpd] = await this.dynamicConnection.query(`select * from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          createPhpRecordDto.hospital_id,
          getOpdId.id
        ])
        adminCaseRefId = getAdminCaseFromOpd.case_reference_id
      }
      const insertDeathRecord = await this.connection.query(`insert into death_report (patient_id,
        case_reference_id,
        attachment,
        attachment_name,
        death_date,
        guardian_name,
        death_report,
        is_active) values (?,?,?,?,?,?,?,?)`, [
        createPhpRecordDto.patient_id,
        createPhpRecordDto.case_reference_id,
        createPhpRecordDto.attachment,
        createPhpRecordDto.attachment_name,
        createPhpRecordDto.death_date,
        createPhpRecordDto.guardian_name,
        createPhpRecordDto.death_report,
        "no"
      ])
      await this.dynamicConnection.query(`insert into death_report (patient_id,
          case_reference_id,
          attachment,
          attachment_name,
          death_date,
          guardian_name,
          death_report,
          is_active,
          Hospital_id,
          hospital_death_report_id) values (?,?,?,?,?,?,?,?,?,?)`, [
        getAdminPatientId.id,
        adminCaseRefId,
        createPhpRecordDto.attachment,
        createPhpRecordDto.attachment_name,
        createPhpRecordDto.death_date,
        createPhpRecordDto.guardian_name,
        createPhpRecordDto.death_report,
        "no",
        createPhpRecordDto.hospital_id,
        insertDeathRecord.insertId
      ])
      return {
        "status": "success",
        "message": "death record inserted successfully"
      }
    } catch (error) {
      return error
    }
  }


  async createBirth(createPhpRecordDto: PhpBirthRecord) {
    try {
      const [getPatUniqueId] = await this.connection.query(`select * from patients where id = ?`, [createPhpRecordDto.patient_id])
      const [getAdminPatientId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatUniqueId.aayush_unique_id])
      const [getIpdId] = await this.connection.query(`select * from ipd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      const [getOpdId] = await this.connection.query(`select * from opd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      let adminCaseRefId;
      if (getIpdId) {
        const [getAdminCaseFromIpd] = await this.dynamicConnection.query(`select * from ipd_details where hospital_id = ? and 
          hospital_ipd_details_id = ?`, [
          createPhpRecordDto.hospital_id,
          getIpdId.id
        ])
        adminCaseRefId = getAdminCaseFromIpd.case_reference_id
      }
      if (getOpdId) {
        const [getAdminCaseFromOpd] = await this.dynamicConnection.query(`select * from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          createPhpRecordDto.hospital_id,
          getOpdId.id
        ])
        adminCaseRefId = getAdminCaseFromOpd.case_reference_id
      }
      const insertDeathRecord = await this.connection.query(`insert into birth_report (
        child_name,
        child_pic,
        gender,
        birth_date,
        weight,
        patient_id,
        case_reference_id,
        contact,
        mother_pic,
        father_name,
        father_pic,
        birth_report,
        document,
        address,
        is_active) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        createPhpRecordDto.child_name,
        createPhpRecordDto.child_pic,
        createPhpRecordDto.gender,
        createPhpRecordDto.birth_date,
        createPhpRecordDto.weight,
        createPhpRecordDto.patient_id,
        createPhpRecordDto.case_reference_id,
        createPhpRecordDto.contact,
        createPhpRecordDto.mother_pic,
        createPhpRecordDto.father_name,
        createPhpRecordDto.father_pic,
        createPhpRecordDto.birth_report,
        createPhpRecordDto.document,
        createPhpRecordDto.address,
        "no"
      ])
      await this.dynamicConnection.query(`insert into birth_report (
          child_name,
          child_pic,
          gender,
          birth_date,
          weight,
          patient_id,
          case_reference_id,
          contact,
          mother_pic,
          father_name,
          father_pic,
          birth_report,
          document,
          address,
          is_active,
          hospital_id,
          hos_birth_report_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        createPhpRecordDto.child_name,
        createPhpRecordDto.child_pic,
        createPhpRecordDto.gender,
        createPhpRecordDto.birth_date,
        createPhpRecordDto.weight,
        getAdminPatientId.id,
        adminCaseRefId,
        createPhpRecordDto.contact,
        createPhpRecordDto.mother_pic,
        createPhpRecordDto.father_name,
        createPhpRecordDto.father_pic,
        createPhpRecordDto.birth_report,
        createPhpRecordDto.document,
        createPhpRecordDto.address,
        "no",
        createPhpRecordDto.hospital_id,
        insertDeathRecord.insertId
      ])
      return {
        "status": "success",
        "message": "birth record inserted successfully"
      }
    } catch (error) {
      return error
    }
  }


  findAll() {
    return `This action returns all phpRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phpRecord`;
  }

  async updateDeath(id: number, createPhpRecordDto: PhpDeathRecord) {
    try {
      const [getPatUniqueId] = await this.connection.query(`select * from patients where id = ?`, [createPhpRecordDto.patient_id])
      const [getAdminPatientId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatUniqueId.aayush_unique_id])
      const [getIpdId] = await this.connection.query(`select * from ipd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      const [getOpdId] = await this.connection.query(`select * from opd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      let adminCaseRefId;
      if (getIpdId) {
        const [getAdminCaseFromIpd] = await this.dynamicConnection.query(`select * from ipd_details where hospital_id = ? and 
          hospital_ipd_details_id = ?`, [
          createPhpRecordDto.hospital_id,
          getIpdId.id
        ])
        adminCaseRefId = getAdminCaseFromIpd.case_reference_id
      }
      if (getOpdId) {
        const [getAdminCaseFromOpd] = await this.dynamicConnection.query(`select * from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          createPhpRecordDto.hospital_id,
          getOpdId.id
        ])
        adminCaseRefId = getAdminCaseFromOpd.case_reference_id
      }
      await this.dynamicConnection.query(`select id from death_report where Hospital_id = ? and hospital_death_report_id = ?`, [
        createPhpRecordDto.hospital_id,
        id
      ])
      await this.connection.query(`update death_report set patient_id = ?,
        case_reference_id = ?,
        attachment = ?,
        attachment_name = ?,
        death_date = ?,
        guardian_name= ?,
        death_report = ?,
        is_active = ? where id = ?`, [
        createPhpRecordDto.patient_id,
        createPhpRecordDto.case_reference_id,
        createPhpRecordDto.attachment,
        createPhpRecordDto.attachment_name,
        createPhpRecordDto.death_date,
        createPhpRecordDto.guardian_name,
        createPhpRecordDto.death_report,
        "no",
        id
      ])
      await this.dynamicConnection.query(`update death_report set patient_id = ?,
          case_reference_id = ?,
          attachment = ?,
          attachment_name = ?,
          death_date = ?,
          guardian_name = ?,
          death_report = ?,
          is_active = ? where 
          Hospital_id = ? and
          hospital_death_report_id = ?`, [
        getAdminPatientId.id,
        adminCaseRefId,
        createPhpRecordDto.attachment,
        createPhpRecordDto.attachment_name,
        createPhpRecordDto.death_date,
        createPhpRecordDto.guardian_name,
        createPhpRecordDto.death_report,
        "no",
        createPhpRecordDto.hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "death record updated successfully"
      }
    } catch (error) {
      return error
    }
  }
  async updateBirth(id: number, createPhpRecordDto: PhpBirthRecord) {
    try {
      const [getPatUniqueId] = await this.connection.query(`select * from patients where id = ?`, [createPhpRecordDto.patient_id])
      const [getAdminPatientId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [getPatUniqueId.aayush_unique_id])
      const [getIpdId] = await this.connection.query(`select * from ipd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      const [getOpdId] = await this.connection.query(`select * from opd_details where case_reference_id = ?`, [createPhpRecordDto.case_reference_id])
      let adminCaseRefId;
      if (getIpdId) {
        const [getAdminCaseFromIpd] = await this.dynamicConnection.query(`select * from ipd_details where hospital_id = ? and 
        hospital_ipd_details_id = ?`, [
          createPhpRecordDto.hospital_id,
          getIpdId.id
        ])
        adminCaseRefId = getAdminCaseFromIpd.case_reference_id
      }
      if (getOpdId) {
        const [getAdminCaseFromOpd] = await this.dynamicConnection.query(`select * from opd_details where Hospital_id = ? and hos_opd_id = ?`, [
          createPhpRecordDto.hospital_id,
          getOpdId.id
        ])
        adminCaseRefId = getAdminCaseFromOpd.case_reference_id
      }
      await this.connection.query(`update birth_report set
      child_name = ?,
      child_pic = ?,
      gender = ?,
      birth_date = ?,
      weight = ?,
      patient_id = ?,
      case_reference_id = ?,
      contact = ?,
      mother_pic = ?,
      father_name = ?,
      father_pic = ?,
      birth_report = ?, 
      document = ?,
      address = ?,
      is_active = ? where id = ?`, [
        createPhpRecordDto.child_name,
        createPhpRecordDto.child_pic,
        createPhpRecordDto.gender,
        createPhpRecordDto.birth_date,
        createPhpRecordDto.weight,
        createPhpRecordDto.patient_id,
        createPhpRecordDto.case_reference_id,
        createPhpRecordDto.contact,
        createPhpRecordDto.mother_pic,
        createPhpRecordDto.father_name,
        createPhpRecordDto.father_pic,
        createPhpRecordDto.birth_report,
        createPhpRecordDto.document,
        createPhpRecordDto.address,
        "no",
        id
      ])
      await this.dynamicConnection.query(`update birth_report set
        child_name = ?,
        child_pic = ?,
        gender = ?,
        birth_date = ?,
        weight = ?,
        patient_id = ?,
        case_reference_id = ?,
        contact = ?,
        mother_pic = ?,
        father_name = ?,
        father_pic = ?,
        birth_report = ?, 
        document = ?,
        address = ?,
        is_active = ? where hospital_id = ? and hos_birth_report_id = ?`, [
        createPhpRecordDto.child_name,
        createPhpRecordDto.child_pic,
        createPhpRecordDto.gender,
        createPhpRecordDto.birth_date,
        createPhpRecordDto.weight,
        getAdminPatientId.id,
        adminCaseRefId,
        createPhpRecordDto.contact,
        createPhpRecordDto.mother_pic,
        createPhpRecordDto.father_name,
        createPhpRecordDto.father_pic,
        createPhpRecordDto.birth_report,
        createPhpRecordDto.document,
        createPhpRecordDto.address,
        "no",
        createPhpRecordDto.hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "birth record updated successfully"
      }
    } catch (error) {
      return error
    }
  }




  async removeDeath(id: number, hospital_id: number) {


    try {

      await this.connection.query(`delete from  death_report where id = ?`, [
        id
      ])
      await this.dynamicConnection.query(`delete from death_report  where 
          Hospital_id = ? and
          hospital_death_report_id = ?`, [
        hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "death record deleted successfully"
      }
    } catch (error) {
      return error
    }
  }

  async removeBirth(id: number, hospital_id: number) {
    try {

      await this.connection.query(`delete from  birth_report where id = ?`, [
        id
      ])
      await this.dynamicConnection.query(`delete from birth_report  where 
            hospital_id = ? and
            hos_birth_report_id = ?`, [
        hospital_id,
        id
      ])
      return {
        "status": "success",
        "message": "birth record deleted successfully"
      }
    } catch (error) {
      return error
    }
  }
}
