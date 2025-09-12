import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PhrAppointmentStatusService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
  ) { }

  async findAll(appointment_id: any) {
    if (appointment_id) {
      const [gethosId] = await this.connection.query(`select * from appointment where id = ?`, [appointment_id])
      try {
        const query = `select appointment_status_id from appointment_status_tracking 
         WHERE appointment_id = ? order by appointment_status_tracking.appointment_status_id DESC limit 1`;

        let getAllStatus = await this.dynamicConnection.query(`select * from appointment_status`)

        const [appointmentStatusData] = await this.dynamicConnection.query(query, [gethosId.hos_appointment_id]);
        let latestappt_status_id = appointmentStatusData.appointment_status_id
        if (latestappt_status_id != 4) {
          getAllStatus = getAllStatus.filter(item => item.id !== 4);
        }
        getAllStatus.forEach(obj => {
          obj.is_completed = obj.id <= latestappt_status_id ? 1 : 0;
        });
        return getAllStatus;
      } catch (error) {
        return error
      }
    } else {
      return {
        "status": "failed",
        "message": "Enter appointment_id to get appointment status"
      }
    }
  }

  async appointment_status_tracking(appointment_id: string) {
    if (appointment_id) {
      const [getHos_id] = await this.connection.query(`select * from appointment where id = ?`, [appointment_id])
      try {
        const query = `select appointment_status.status,appointment_status.color_code,appointment_status_tracking.appointment_status_id,
        appointment_status_tracking.appointment_id,
       concat( DATE_FORMAT(date(appointment_status_tracking.date_updated), '%D %b %Y')," ",
        DATE_FORMAT(time(appointment_status_tracking.date_updated), '%h:%i %p')) date_updated
        from appointment_status_tracking
        left join appointment_status on appointment_status.id = appointment_status_tracking.appointment_status_id WHERE appointment_id = ?`;
        const appointmentStatusData = await this.dynamicConnection.query(query, [getHos_id.hos_appointment_id]);
        return appointmentStatusData;
      } catch (error) {
        return error;
      }
    } else {
      return {
        status: "failed",
        message: "Enter appointment_id to get the values"
      };
    }

  }
  async findAllForTracking(hospital_id: number) {
    if (hospital_id) {
      try {
        const query = `SELECT * FROM appointment_status WHERE appointment_status.id <> 4`;
        const appointmentStatusData = await this.dynamicConnection.query(query);
        return appointmentStatusData;
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
