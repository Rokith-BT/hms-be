import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalOpdOverviewConsultantDoctorService {
  constructor(private readonly connection: DataSource
  ) { }

  async findAll(patient_id: number) {
    try {
      const consultant_doctor = await this.connection.query(`select distinct patients.patient_name as name,opd_details.patient_id ,group_concat(distinct concat( staff.name, ' ', staff.surname,staff.employee_id) separator',') AS consultant_doctor
    from visit_details
     join opd_details ON visit_details.opd_details_id = opd_details.id   
      join patients ON patients.id = opd_details.patient_id
      join staff ON staff.id = visit_details.cons_doctor where opd_details.patient_id = ?`, [patient_id])
      return consultant_doctor;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }



}
