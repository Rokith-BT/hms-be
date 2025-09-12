import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { InternalOpdTreatmentHistory } from "./entities/internal-opd-treatment-history.entity";

@Injectable()
export class InternalOpdTreatmentHistoryService {
  constructor(private readonly connection: DataSource
  ) { }

  async findAll(patient_id: number) {
    try {
      const treatment_history = await this.connection.query(`
    select patients.id as patient_id,
    opd_details.case_reference_id as case_id,
    visit_details.appointment_date,
    visit_details.symptoms,
    CONCAT('OPDN', visit_details.opd_details_id) AS OPD_ID,
    patients.patient_name,
    visit_details.case_type ,
    opd_details.discharged,
     concat(staff.name," ",staff.surname," ","(",staff.employee_id,")") as consultant_doctor ,
     visit_details.refference from visit_details
    left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join staff on visit_details.cons_doctor = staff.id 
    where patients.id = ? and opd_details.discharged = 'yes'`, [patient_id]);
      return treatment_history;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findOne(patient_id: number, opd_details_id: number) {
    try {
      const treatment_his = await this.connection.query(`select patients.id as patient_id,visit_details.id as OPDcheckupID,opd_details.case_reference_id as case_id,
    visit_details.patient_old as old_patient,patients.gender,patients.mobileno as phone,
    patients.address,
    concat(patients.age,"years"," ",patients.month,"month"," " ,patients.day,"days") as age,
    visit_details.weight,visit_details.pulse,visit_details.respiration,visit_details.appointment_date,
    visit_details.casualty,organisation.organisation_name as TPA,visit_details.note,visit_details.symptoms,
    CONCAT('OPDN', visit_details.opd_details_id) AS OPD_ID,patients.patient_name,patients.guardian_name,patients.marital_status,patients.email,
    visit_details.height,visit_details.bp,visit_details.temperature,visit_details.known_allergies,visit_details.case_type ,
    staff.name as consultant_doctor ,visit_details.refference from visit_details
    left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join staff on visit_details.cons_doctor = staff.id 
    where  opd_details.id = ? and patients.id = ?`, [opd_details_id, patient_id])
      return treatment_his;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }


  async findTreatmentHistorySearch(patientId: number, search: string): Promise<InternalOpdTreatmentHistory[]> {
    let query = ` select patients.id as patient_id,
    opd_details.case_reference_id as case_id,
    visit_details.appointment_date,
    visit_details.symptoms,
    CONCAT('OPDN', visit_details.opd_details_id) AS OPD_ID,
    patients.patient_name,
    visit_details.case_type ,
    opd_details.discharged,
     concat(staff.name," ",staff.surname," ","(",staff.employee_id,")") as consultant_doctor ,visit_details.refference from visit_details
    left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join staff on visit_details.cons_doctor = staff.id 
    where patients.id = ? and opd_details.discharged = 'yes' `;
    let values: (number | string)[] = [patientId];

    if (search) {
      query += ` AND (CONCAT('OPDN', visit_details.opd_details_id) LIKE ? 
                      OR opd_details.case_reference_id LIKE ? 
                      OR visit_details.appointment_date LIKE ? 
                      OR visit_details.symptoms LIKE ? 
                      OR concat(staff.name," ",staff.surname," ","(",staff.employee_id,")") LIKE ? ) `;

      const searchValue = `%${search}%`;
      values.push(searchValue, searchValue, searchValue, searchValue, searchValue);
    }
    try {
      const rows = await this.connection.query(query, values);
      return rows;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async treatmentfindall(limit: number, page: number, patient_id: number, search: String) {
    try {
      const offset = limit * (page - 1);

      let dateCondition = '';
      let searchClause = '';

      if (search) {
        const searchClause = `(
    visit_details.opd_details_id LIKE '%${search}%' OR
    opd_details.case_reference_id LIKE '%${search}%' OR
    visit_details.appointment_date LIKE '%${search}%' OR
    visit_details.symptoms LIKE '%${search}%' OR
    staff.name LIKE '%${search}%' OR
    staff.surname LIKE '%${search}%' OR
    staff.id LIKE '%${search}%'

    )`

        dateCondition = ` AND ${searchClause}`;
      }
      const treatment_history = await this.connection.query(`
    select patients.id as patient_id,
    opd_details.case_reference_id as case_id,
    visit_details.appointment_date,
    visit_details.symptoms,
    CONCAT('OPDN', visit_details.opd_details_id) AS OPD_ID,
    patients.patient_name,
    visit_details.case_type ,
    opd_details.discharged,
     concat(staff.name," ",staff.surname," ","(",staff.employee_id,")") as consultant_doctor ,
     visit_details.refference from visit_details
    left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join staff on visit_details.cons_doctor = staff.id 
    where patients.id = ? and opd_details.discharged = 'yes' ${dateCondition} LIMIT ? OFFSET ?`,
        [patient_id, Number(limit), Number(offset)])



      let [totallist] = await this.connection.query(`SELECT count(visit_details.id) as total from visit_details
          left join opd_details on visit_details.opd_details_id = opd_details.id
    left join patients on opd_details.patient_id = patients.id
    left join organisation on visit_details.organisation_id = organisation.id
    left join staff on visit_details.cons_doctor = staff.id 
    where patients.id = ? and opd_details.discharged = 'yes' ${dateCondition} `, [patient_id]);

      let variable = {
        details: treatment_history,
        total: totallist.total,
        page: page,
        limit: limit
      }

      return variable;
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }







}
