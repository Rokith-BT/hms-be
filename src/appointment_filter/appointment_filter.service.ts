import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppointmentFilterService {
  constructor(private readonly connection: DataSource) { }

  async findall(
    date: string,
    fromDate: string,
    todate: string,
    doctorId: number,
    live_consult: string,
    appointment_status: string,
    gender: string,
    global_shift_id: number,
    doctor_shift: number,
  ) {
    try {


      let query = `select appointment.id,appointment.date,concat(patients.patient_name," ","(",appointment.patient_id,")") as patient_name,
    concat('APPN','',appointment.id) as appointment_no,
     concat(patients.age,"years"," ",patients.month,"month"," ",patients.day,"day") as age ,
     patients.email as Email,
     appointment.date as appointment_date, appointment.time, patients.mobileno as mobileno,
     appoint_priority.priority_status,
     patients.gender,
     global_shift.id  as shift_id,global_shift.name as shift,
      CONCAT( staff.name, ' ', staff.surname,((staff.employee_id))) AS doctor,
      doctor_shift.id as slot_id, doctor_shift.day as slot,
      department.department_name,
      patient_charges.amount,
      appointment.live_consult,
        appointment.appointment_status,
        transactions.note,
    transactions.payment_mode,
    concat("TRID",visit_details.transaction_id) as Transaction_id,
    appointment.message,
      appointment.source,  
       appointment.created_at from appointment
      join patients ON appointment.patient_id = patients.id
      left join staff ON appointment.doctor = staff.id
      left join appoint_priority ON appointment.priority = appoint_priority.id
      left join global_shift ON appointment.global_shift_id = global_shift.id
      left join doctor_shift ON appointment.shift_id = doctor_shift.id
      left join visit_details ON appointment.visit_details_id = visit_details.id
      left join transactions ON visit_details.transaction_id = transactions.id
        left join department ON staff.department_id = department.id
        left join patient_charges ON visit_details.patient_charge_id = patient_charges.id `;
      let values = [];

      if (fromDate && todate) {
        date =
          `date(appointment.date) >= date ('` +
          fromDate +
          `') and date(appointment.date) <= date ('` +
          todate +
          `')`;
      } else if (fromDate) {
        date = ` date(appointment.date) >= date('` + fromDate + `')`;
      } else if (todate) {
        date = ` date(appointment.date) <= date('` + todate + `')`;
      } else {
        date = ` appointment.date < Date(NOw())`;
      }

      let where = `where ` + date;
      if (doctorId) {
        where += ` and appointment.doctor = ?`;
        values.push(doctorId);
      }
      if (appointment_status) {
        where += ` and appointment.appointment_status = ?`;
        values.push(appointment_status);
      }
      if (live_consult) {
        where += ` and appointment.live_consult = ?`;
        values.push(live_consult);
      }
      if (gender) {
        where += ` and patients.gender = ?`;
        values.push(gender);
      }
      if (global_shift_id) {
        where += ` and appointment.global_shift_id = ?`;
        values.push(global_shift_id);
      }
      if (doctor_shift) {
        where += ` and appointment.shift_id = ?`;
        values.push(doctor_shift);
      }
      let order = ` order by appointment.date asc , appointment.time asc `;

      let final = query + where + order;

      const appointment_filter = await this.connection.query(final, values);

      return appointment_filter;
    }
    catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}