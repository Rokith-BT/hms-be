import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CheckForDuplicateAppointment } from './entities/check-for-duplicate-appointment.entity';

@Injectable()
export class CheckForDuplicateAppointmentService {
  constructor(private readonly connection: DataSource,
  ) { }

  async create(AppointmentEntity: CheckForDuplicateAppointment) {
    try {
      const checkDuplicate = await this.connection.query(`select * from appointment 
      where patient_id = ? and doctor = ? and shift_id = ? and date = ? and appointment_status_id <> 4`, [
        AppointmentEntity.patient_id,
        AppointmentEntity.doctor,
        AppointmentEntity.shift_id,
        AppointmentEntity.date
      ])
      if (checkDuplicate.length > 0) {
        return {
          "status": process.env.SUCCESS_STATUS_V2,
          "message": process.env.DUPLICATE_APPOINTMENT,
          "is_duplicate_appointment": true
        }
      } else {
        return {
          "status": process.env.SUCCESS_STATUS_V2,
          "message": process.env.APPOINTMENT_BOOKED,
          "is_duplicate_appointment": false
        }
      }
    } catch (error) {
      return {
        "status": process.env.ERROR_STATUS_V2,
        "message": process.env.ERROR_MESSAGE_V2,
        "error": error
      }
    }
  }

}
