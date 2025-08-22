import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckForDuplicateAppointment } from './entities/op-hub-check-for-duplicate-appointment.entity';

@Injectable()
export class OpHubCheckForDuplicateAppointmentService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async create(AppointmentEntity: CheckForDuplicateAppointment) {

    if (AppointmentEntity.Hospital_id) {

      try {
        const checkDuplicate = await this.dynamicConnection.query(`select * from appointment 
      where patient_id = ? and doctor = ? and shift_id = ? and date = ? and appointment_status_id <> 4`, [
          AppointmentEntity.patient_id,
          AppointmentEntity.doctor,
          AppointmentEntity.shift_id,
          AppointmentEntity.date
        ])
        if (checkDuplicate.length > 0) {
          return {
            "status": "succes",
            "message": "cannot book duplicate appointment",
            "is_duplicate_appointment": true
          }
        } else {
          return {
            "status": "succes",
            "message": "can book appointment",
            "is_duplicate_appointment": false
          }
        }
      } catch (error) {
        return {
          "status": "failed",
          "message": "unable to check duplicate appointment",
          "error": error
        }
      }
    } else {
      return {
        "status": "failed",
        "message": "Enter Hospital_id to check duplicate appointment"
      }
    }


  }




}
