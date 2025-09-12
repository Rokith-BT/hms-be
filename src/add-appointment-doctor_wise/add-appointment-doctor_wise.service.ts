import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AddAppointmentDoctorWiseService {
  constructor(private readonly connection: DataSource) { }

  async findall(doctor: number, date: string) {
    try {

      let q = `select distinct appointment.id,appointment.doctor, concat(patients.patient_name,"(",patients.id,")") as patient_name,patients.mobileno as phone ,appointment.time,patients.email,
    appointment.date,appointment.source from appointment
    left join patients on appointment.patient_id = patients.id
    left join staff on  appointment.doctor = staff.id 
    where doctor = ? and date( appointment.date )= ?`;
      let v = [doctor, date];
      const doctor_wise = await this.connection.query(q, v);

      return doctor_wise;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }


  }

  async findalldoctorwise(doctor: number, date: string, limit: number, page: number): Promise<any> {
    try {


      const offset = limit * (page - 1);
      let q = `select distinct appointment.id,appointment.doctor, concat(patients.patient_name,"(",patients.id,")") as patient_name,patients.mobileno as phone ,appointment.time,patients.email,
    appointment.date,appointment.source from appointment
    left join patients on appointment.patient_id = patients.id
    left join staff on  appointment.doctor = staff.id 
    where doctor = ? and date( appointment.date )= ? LIMIT ? OFFSET ?`;
      let v = [doctor, date, Number(limit), Number(offset)];

      const doctor_wise = await this.connection.query(q, v);
      let [totallist] = await this.connection.query(` SELECT COUNT(DISTINCT appointment.id) AS total_count
FROM appointment
LEFT JOIN patients ON appointment.patient_id = patients.id
LEFT JOIN staff ON appointment.doctor = staff.id 
WHERE doctor = ?
AND DATE(appointment.date) = ?`, [
        doctor,
        date,
      ]);


      let variable = {
        details: doctor_wise,
        total: totallist.total_count,
        limit: limit
      }

      return variable;
    } catch (error) {

      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}

