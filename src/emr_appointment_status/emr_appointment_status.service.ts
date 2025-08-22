import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class EmrAppointmentStatusService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }



  async findAll(hospital_id: number) {

    if (hospital_id) {

      try {
        const getStatus = await this.connection.query(`select * from appointment_status`)
        return getStatus;
      } catch (error) {
        return error
      }
    } else {
      return {
        "status": "failed",
        "message": "Enter hospital_id to get appointment status"
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
          let getAllStatus = await this.connection.query(`select * from appointment_status`)

          const [appointmentStatusData] = await this.connection.query(query, [numb]);
          let latestappt_status_id = appointmentStatusData.appointment_status_id
          if (latestappt_status_id != 4) {
            getAllStatus = getAllStatus.filter(item => item.id !== 4);
            getAllStatus.forEach(obj => {
              obj.is_completed = obj.id <= latestappt_status_id ? 1 : 0;
            });
            return getAllStatus;
          } else {
            getAllStatus = getAllStatus.filter(item => item.id <= 4);
            let try1 = await this.connection.query(`select appointment_status_id from appointment_status_tracking 
    WHERE appointment_id = ?`, [numb])
            let try2 = await this.connection.query(`select distinct appointment_status_id from appointment_status_tracking 
      WHERE appointment_id = ? order by appointment_status_tracking.appointment_status_id DESC `, [numb])
            getAllStatus.forEach(async item => {
              try1.forEach(a => {
                if (item.id <= try2[try2.length - 2].appointment_status_id) {
                  item.is_completed = 1
                } else {
                  item.is_completed = 0
                }
                if (item.id == 4) {
                  item.is_completed = 1
                }
              })
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







}
