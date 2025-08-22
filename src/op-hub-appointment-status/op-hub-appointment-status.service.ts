import { Injectable } from '@nestjs/common';
import { CreateOpHubAppointmentStatusDto } from './dto/create-op-hub-appointment-status.dto';
import { UpdateOpHubAppointmentStatusDto } from './dto/update-op-hub-appointment-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubAppointmentStatusService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async findAll(hospital_id: number) {
    if (hospital_id) {
      try {
        const getStatus = await this.dynamicConnection.query(`select * from appointment_status`)
        return getStatus;
      } catch (error) {
        throw new Error(error)
      }
    } else {
      return {
        status: "failed",
        message: "Enter hospital_id to get appointment status"
      }
    }
  }

  async appointment_status_tracking(hospital_id: number, appointment_id: string) {
    if (hospital_id) {
      if (appointment_id) {
        try {
          const query = `select appointment_status_id from appointment_status_tracking 
        WHERE appointment_id = ? order by appointment_status_tracking.appointment_status_id DESC limit 1`;
          let numb
          try {
            numb = appointment_id.replace(/[a-zA-Z]/g, '')
          }
          catch (err) {
            numb = appointment_id
          }
          let getAllStatus = await this.dynamicConnection.query(`select * from appointment_status`)
          const [appointmentStatusData] = await this.dynamicConnection.query(query, [numb]);
          let latestappt_status_id = appointmentStatusData.appointment_status_id
          if (latestappt_status_id != 4) {
            getAllStatus = getAllStatus.filter(item => item.id !== 4);
            getAllStatus.forEach(obj => {
              obj.is_completed = obj.id <= latestappt_status_id ? 1 : 0;
            });
            return getAllStatus;
          } else {
            getAllStatus = getAllStatus.filter(item => item.id <= 4);
            let try1 = await this.dynamicConnection.query(`select appointment_status_id from appointment_status_tracking 
    WHERE appointment_id = ?`, [numb])
            let try2 = await this.dynamicConnection.query(`select distinct appointment_status_id from appointment_status_tracking 
      WHERE appointment_id = ? order by appointment_status_tracking.appointment_status_id DESC `, [numb])
            getAllStatus.forEach(item => {
              item.is_completed = try1.find(a => item.id == a.appointment_status_id) ? 1 : 0;
            });
          }
          const filteredArray = getAllStatus.filter(item => item.is_completed === 1);
          return filteredArray
        } catch (error) {
          return error;
        }
      } else {
        return {
          status: "failed",
          message: "Enter appointment_id to get the values"
        };
      }
    } else {
      return {
        status: "failed",
        message: "Enter hospital_id to get the values"
      };
    }
  }



  async findAllForTracking(hospital_id: number) {

    if (hospital_id) {
      try {
        const query = `SELECT * FROM appointment_status WHERE appointment_status.id <> 4`;
        const appointmentStatusData = await this.dynamicConnection.query(query);
        let output = []
        output.push(appointmentStatusData[0])
        output.push(appointmentStatusData[1])
        output.push(appointmentStatusData[2])
        output.push(appointmentStatusData[4])
        output.push(appointmentStatusData[3])
        return output;
      } catch (error) {
        return error;
      }
    } else {
      return {
        status: "failed",
        message: "Enter hospital_id to get the values"
      };
    }
  }


}
