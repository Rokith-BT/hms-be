import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CountDto } from './add-appointment-patient_queue.dto';
import { AddAppointmentPatientQueue } from './entities/add-appointment-patient_queue.entity';

@Injectable()
export class AddAppointmentPatientQueueService {
  constructor(private readonly connection: DataSource) { }

  async findall(
    doctor: number,
    date: string,
    global_shift_id: number,
    doctor_shift: number,
  ) {
    try {
      let q = `  select distinct appointment.id, concat(patients.patient_name,"(",patients.id,")") as patient_name,patients.mobileno as phone ,appointment.time,patients.email,
    appointment.date,appointment.source from appointment
        left join patients on appointment.patient_id = patients.id
            left join staff on  appointment.doctor = staff.id 
        left join doctor_shift on doctor_shift.staff_id = staff.id
        left join doctor_global_shift on doctor_global_shift.staff_id = staff.id
            where doctor = ? and date( appointment.date )= ? and appointment.global_shift_id = ? and doctor_shift.id = ?`;
      let v = [doctor, date, global_shift_id, doctor_shift];

      const patient_queue = await this.connection.query(q, v);

      return patient_queue;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async findallpatientqueue(doctor: number,
    date: string,
    global_shift_id: number,
    doctor_shift: number, limit: number, page: number): Promise<CountDto> {
    try {
      const offset = limit * (page - 1);

      let q = `  select distinct appointment.id, concat(patients.patient_name,"(",patients.id,")") as patient_name,patients.mobileno as phone ,appointment.time,patients.email,
      appointment.date,appointment.source from appointment
          left join patients on appointment.patient_id = patients.id
              left join staff on  appointment.doctor = staff.id 
          left join doctor_shift on doctor_shift.staff_id = staff.id
          left join doctor_global_shift on doctor_global_shift.staff_id = staff.id
              where doctor = ? and date( appointment.date )= ? and appointment.global_shift_id = ? and doctor_shift.id = ? LIMIT ? OFFSET ?`;
      let v = [doctor, date, global_shift_id, doctor_shift, Number(limit), Number(offset)];

      const patient_queue = await this.connection.query(q, v);

      let [totallist] = await this.connection.query(` SELECT COUNT(DISTINCT appointment.id) AS total_count
FROM appointment
LEFT JOIN patients ON appointment.patient_id = patients.id
LEFT JOIN staff ON appointment.doctor = staff.id 
LEFT JOIN doctor_shift ON doctor_shift.staff_id = staff.id
LEFT JOIN doctor_global_shift ON doctor_global_shift.staff_id = staff.id
WHERE doctor = ? 
AND DATE(appointment.date) = ? 
AND appointment.global_shift_id = ?
AND doctor_shift.id = ?`, [
        doctor,
        date,
        global_shift_id,
        doctor_shift
      ])

      let appointment_patient_queue_variable = {
        details: patient_queue,
        total: totallist.total_count

      }

      return appointment_patient_queue_variable;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
