import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalOpdOverviewService {
  constructor(private readonly connection: DataSource
  ) { }

  async findALL(patient_id: number) {
    try {
      const overview = await this.connection.query(` select distinct concat(patients.patient_name," ","(",patients.id,")") as name,patients.gender,concat(patients.age,"year"," " ,patients.month,"months"," " , patients.day,"days") as age,
   patients.guardian_name,patients.mobileno as phone ,patients.known_allergies, visit_details.symptoms, opd_details.id as OPD_ID from visit_details
   join opd_details ON visit_details.opd_details_id = opd_details.id  
    join patients ON patients.id = opd_details.patient_id  where patients.id = ?`, [patient_id])
      return overview;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }






}
