import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EmrAppointmentFilterService {
  constructor(private readonly connection: DataSource
  ) { }

  async find_slot_filter(global_shift_id: any, date: any, staff_id: number) {
    try {
      const filter = await this.connection.query(`select distinct doctor_shift.id as id, doctor_shift.global_shift_id, doctor_shift.start_time, doctor_shift.end_time from doctor_shift
where doctor_shift.global_shift_id = ?  and doctor_shift.day = dayname(?)`, [global_shift_id, date, staff_id])
      return filter;
    } catch (error) {
      return error;
    }
  }


  async find_shift_filter(staff_id: any, date: any) {
    try {
      const shift_filter = await this.connection.query(`select distinct global_shift.id as id, doctor_global_shift.staff_id, global_shift.name ,doctor_shift.day,  global_shift.start_time, global_shift.end_time from global_shift 
 left join doctor_shift on doctor_shift.global_shift_id = global_shift.id 
left join doctor_global_shift on doctor_global_shift.global_shift_id = global_shift.id
where doctor_global_shift.staff_id = ? and doctor_shift.day = dayname(?)`, [staff_id, date])
      return shift_filter;

    } catch (error) {
      return error;
    }
  }



}
