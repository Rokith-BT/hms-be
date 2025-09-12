import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DoctorSlotShift } from './entities/op-hub-doctor-slot-shift-service.entity';
@Injectable()
export class OpHubDoctorSlotShiftServiceService {
 

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async getShift(Entity: DoctorSlotShift) {

    if (Entity.hospital_id) {
      try {
        let query = `select global_shift.name,global_shift.id shift_id,doctor_global_shift.staff_id
from doctor_global_shift left join global_shift 
on global_shift.id = doctor_global_shift.global_shift_id where staff_id = ? `
        let values = []

        if (Entity.staff_id) {
          values.push(Entity.staff_id)
          const getShifts = await this.dynamicConnection.query(query, values)
          return getShifts
        } else {

          return {
            "message": "Select Doctor to get Shifts"
          }
        }
      } catch (error) {

        return error
      }
    } else {
      return {
        "message": "Enter hospital_id to get shift"
      }
    }
  }

  async getSlot(Entity: DoctorSlotShift) {
    if (Entity.hospital_id) {
      try {

        let query = `select doctor_shift.id shiftId, doctor_shift.start_time,
  doctor_shift.end_time,
  concat( doctor_shift.start_time," - ",doctor_shift.end_time) slot_timing ,
  doctor_shift.day,global_shift.name shiftName,
  doctor_shift.global_shift_id global_shift_id from doctor_shift
  left join global_shift on global_shift.id = doctor_shift.global_shift_id
   where staff_id = ?
  and day = dayname(?) `
        let values = []
        if (Entity.staff_id) {
          values.push(Entity.staff_id)
          if (Entity.date) {
            values.push(Entity.date)
            let getShifts = await this.dynamicConnection.query(query, values)
            const [getS] = await this.dynamicConnection.query('select time(now()) as time ')


            const currentDate = new Date();

            const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            if (Entity.date === formattedDate) {
              getShifts = getShifts.filter(a => a.end_time >= getS.time);
            }
            return getShifts
          } else {
            return { "message": "Select date to get the slots" }
          }
        } else {
          return {
            "message": "Select Doctor to get Shifts"
          }
        }
      } catch (error) {
        return error
      }
    } else {
      return {
        "message": "Enter hospital_id to get shift"
      }
    }
  }
}
