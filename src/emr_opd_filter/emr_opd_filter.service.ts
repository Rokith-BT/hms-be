import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class EmrOpdFilterService {
  constructor(private readonly connection: DataSource ){} 


  async findAll(fromDate:string,toDate:string,doctorId:number,gender:string,status:string) {

    try {
      let query = `  
 SELECT distinct
    visit_details.id AS id, 
    patients.patient_name AS name, 
    patients.id AS PT_id, 
    CONCAT(patients.age, ' years') AS age, 
    patients.gender, 
    patients.image,
    CONCAT('OPN', visit_details.opd_details_id) AS OP_NO, 
    patients.mobileno, 
    patients.dial_code, 
    CONCAT('Dr. ', staff.name, ' ', staff.surname) AS consultant,
    visit_details.cons_doctor AS doctor_id, 
   concat(doctor_shift.start_time,'-',doctor_shift.end_time) as time_slot,
    patients.abha_address, 
    patient_charges.amount AS apptFees,    
    visit_details.appointment_date,
                opd_status.status,
                appointment_queue.position

FROM 
    visit_details 
    left join opd_details ON visit_details.opd_details_id = opd_details.id
    left join patients ON opd_details.patient_id = patients.id
LEFT JOIN 
    patient_charges ON patient_charges.id = visit_details.patient_charge_id
LEFT JOIN 
    staff ON staff.id = visit_details.cons_doctor
LEFT JOIN 
   doctor_shift on  visit_details.cons_doctor = doctor_shift.staff_id
   and dayname(visit_details.appointment_date) = doctor_shift.day
   and time(visit_details.appointment_date) >= time(doctor_shift.start_time) 
   and time(visit_details.appointment_date) <= time(doctor_shift.end_time) 
    LEFT JOIN opd_status ON opd_status.opd_id = opd_details.id
        Left join appointment_queue on appointment_queue.opd_id = opd_details.id
 `
      let date;
      let values = []

      if(fromDate && toDate) {
        date = `date(visit_details.appointment_date) >= date( '`+fromDate+`' ) and date(visit_details.appointment_date) <= date( '`+toDate+`' )`
      } else if(fromDate) {
        date = ` date(visit_details.appointment_date) >= date( '`+fromDate+`')`
      } else if(toDate){
        date = ` date(visit_details.appointment_date) <= date( '`+toDate+`')`
      }
      else {
        date = `visit_details.appointment_date `
      }
      let where = `WHERE  `+ date
      if(doctorId){
     where += ` and visit_details.cons_doctor = ?`
     values.push(doctorId)
      }
      if(gender){
        where +=` AND patients.gender = ?`;
        values.push(gender);
      }     
      if(status){
        where +=` AND opd_status.status = ?`;
        values.push(status);
      }
      let order = `ORDER BY date(visit_details.appointment_date) ASC  `

let final = query+where+order

const GetTodayOPD = await this.connection.query(final,values)
return GetTodayOPD

    } catch (error) {
      return error;
    }
  }




}
