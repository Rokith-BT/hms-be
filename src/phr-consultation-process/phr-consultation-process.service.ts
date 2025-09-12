import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PhrConsultationProcess } from './entities/phr-consultation-process.entity';

@Injectable()
export class PhrConsultationProcessService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
  ) { }
  async findAllColorCode(hospital_id: number) {
    if (hospital_id) {
      try {
        const query = `SELECT * FROM PT_constultation_process_color_code`;
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

  async findAllProcessList(appointment_id: number) {
    if (appointment_id) {
      const [getHosId] = await this.connection.query(` select * from appointment where id = ? `, [appointment_id])
      try {
        if (getHosId.appointment_status_id > 4) {
          const query = `SELECT * FROM PT_consultation_process_list`;
          const appointmentStatusData = await this.dynamicConnection.query(query);
          return appointmentStatusData;
        }
        else {
          return {
            "status": "failed",
            "message": "consultation process will not be shown untill the appointment is in progress."
          }
        }
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

  async findAllProcessTrackList(appointment_id: string) {
    if (appointment_id) {

      const [getHosId] = await this.connection.query(` select * from appointment where id = ? `, [appointment_id])
      try {
        if (getHosId.appointment_status_id > 4) {
          const query = `select concat(staff.name," ",staff.surname) doctor,
        PT_consultation_process_tracking.description,
        PT_consultation_process_list.process_name Consultation_Process,
        PT_constultation_process_color_code.color_code,
        PT_constultation_process_color_code.name status,
        concat(
        DATE_FORMAT(PT_consultation_process_list.created_at, '%D %b %Y')," ",
        DATE_FORMAT(PT_consultation_process_list.created_at, '%h:%i %p')) timing
        from PT_consultation_process_tracking
        left join staff on staff.id = PT_consultation_process_tracking.staff_id
        left join PT_consultation_process_list
        on PT_consultation_process_list.id = PT_consultation_process_tracking.consultaiton_process_list_id
        left join PT_constultation_process_color_code on PT_constultation_process_color_code.id = PT_consultation_process_tracking.consultation_process_color_code_id
        where PT_consultation_process_tracking.appointment_id = ?`;
          const appointmentStatusData = await this.dynamicConnection.query(query, [getHosId.hos_appointment_id]);
          return appointmentStatusData;
        } else {
          return {
            "status": "failed",
            "message": "consultation process will not be shown untill the appointment is in progress."
          }
        }
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

  async ProcessTrackHistory(appointment_id: number) {
    if (appointment_id) {
      const [getHosId] = await this.connection.query(` select * from appointment where id = ? `, [appointment_id])
      if (getHosId.appointment_status_id > 4) {
        try {
          const query = `SELECT * FROM PT_consultation_process_transaction_history`;
          const appointmentStatusData = await this.dynamicConnection.query(query);
          return appointmentStatusData;
        } catch (error) {
          return error;
        }
      } else {
        return {
          "status": "failed",
          "message": "consultation process waiting can be done only when appointment is in progress."
        }
      }
    } else {
      return {
        status: "failed",
        message: "Enter hospital_id to get the values"
      };
    }
  }
  async gettrackstats(appointment_id: string) {
    console.log("1122112");

    if (appointment_id) {
      const [getHosId] = await this.connection.query(`select * from appointment where id = ?`, [appointment_id])
      try {
        const query = `SELECT 
                        (SELECT COUNT(*) FROM PT_consultation_process_list) AS total,
                        (SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 3 AND appointment_id = ?) AS completed,
                        (SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 2 AND appointment_id = ?) AS ongoing,
                        (SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 1 AND appointment_id = ?) AS waiting,
                        ((SELECT COUNT(*) FROM PT_consultation_process_list) - 
                        ((SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 3 AND appointment_id = ?) + 
                        (SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 2 AND appointment_id = ?) +
                        (SELECT COUNT(*) FROM PT_consultation_process_tracking WHERE consultation_process_color_code_id = 1 AND appointment_id = ?))
                        ) AS notAttended`;

        const consultationStatusData = await this.dynamicConnection.query(query, [getHosId.hos_appointment_id, getHosId.hos_appointment_id,
        getHosId.hos_appointment_id, getHosId.hos_appointment_id, getHosId.hos_appointment_id, getHosId.hos_appointment_id]);
        return consultationStatusData[0];
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

  async checkbooked(updateconsultation: PhrConsultationProcess) {
    if (!updateconsultation.appointment_id) {
      return [{
        "status": "failed",
        "message": "Enter appointment_id to update process"
      }];
    }
    const [getApptDetails] = await this.connection.query(` select * from appointment where id = ? `, [updateconsultation.appointment_id])
    if (getApptDetails.appointment_status_id >= 3 && getApptDetails.appointment_status_id != 4) {

      const [getApptDetails] = await this.connection.query(` select * from appointment where id = ? `, [updateconsultation.appointment_id])
      try {
        if (updateconsultation.appointment_id && updateconsultation.consultaiton_process_list_id) {
          const recordExistsQuery = `
                SELECT id
                FROM PT_consultation_process_tracking
                WHERE appointment_id = ? AND consultaiton_process_list_id = ? 
            `;
          const [existingRecord] = await this.dynamicConnection.query(recordExistsQuery, [getApptDetails.hos_appointment_id, updateconsultation.consultaiton_process_list_id]);
          if (existingRecord) {
            return [{
              "status": "failed",
              "message": "already initiated"
            }];
          } else {
            return [{
              "status": "success",
              "message": "can be initiated"
            }];
          }
        }
      } catch (error) {
        console.error('Error in process update:', error);
        return [{
          "status": "failed",
          "message": "Error in process update"
        }];
      }
    } else {
      return {
        "status": "failed",
        "message": "consultation process waiting can be done only when appointment is in progress."
      }
    }
  }

  async createWaiting(updateconsultation: PhrConsultationProcess) {
    if (!updateconsultation.appointment_id) {
      return [{
        "status": "failed",
        "message": "Enter appointment_id to update process"
      }];
    }

    const [getApptDetails] = await this.connection.query(` select * from appointment where id = ? `, [updateconsultation.appointment_id])
    if (getApptDetails.appointment_status_id > 4) {

      const [getApptDetails] = await this.connection.query(` select * from appointment where id = ? `, [updateconsultation.appointment_id])
      try {
        if (updateconsultation.appointment_id && updateconsultation.consultaiton_process_list_id) {
          const recordExistsQuery = `
                SELECT id
                FROM PT_consultation_process_tracking
                WHERE appointment_id = ? AND consultaiton_process_list_id = ?
            `;
          const [existingRecord] = await this.dynamicConnection.query(recordExistsQuery, [getApptDetails.hos_appointment_id, updateconsultation.consultaiton_process_list_id]);
          if (existingRecord) {
            return [{
              "status": "success",
              "message": "Consultation Process has already been initiated."
            }];
          } else {
            const [getAdminPatientDetails] = await this.connection.query(`select * from patients where id = ?`, [updateconsultation.patient_id])
            const [getHosPatientId] = await this.dynamicConnection.query(`select * from patients where aayush_unique_id = ?`, [
              getAdminPatientDetails.aayush_unique_id
            ])
            const [getHosProcessListId] = await this.connection.query(`select * from PT_consultation_process_list
   where hos_PT_consultation_process_list_id = ? and 
   hospital_id = ? `, [updateconsultation.consultaiton_process_list_id, getApptDetails.Hospital_id])
            const updateResult = await this.dynamicConnection.query(`
                    INSERT INTO PT_consultation_process_tracking
                        (patient_id, appointment_id, consultation_process_color_code_id, 
                          consultaiton_process_list_id, description)
                    VALUES (?, ?, ?, ?, ?)`,
              [
                getHosPatientId.id,
                getApptDetails.hos_appointment_id,
                1,
                updateconsultation.consultaiton_process_list_id,
                updateconsultation.description
              ]
            );

            await this.connection.query(`
                                  INSERT INTO PT_consultation_process_tracking
                                      (patient_id, appointment_id, consultation_process_color_code_id, consultaiton_process_list_id,
                                         description,hospital_id,hos_consultation_process_tracking_id)
                                  VALUES (?, ?, ?, ?, ?,?,?)`,
              [
                updateconsultation.patient_id,
                updateconsultation.appointment_id,
                1,
                getHosProcessListId.id,
                updateconsultation.description,
                getApptDetails.Hospital_id,
                updateResult.insertId
              ]
            );
            return [{
              "status": "success",
              "message": "consultation Process inserted successfully"
            }];
          }
        }
      } catch (error) {
        console.error('Error in process update:', error);
        return [{
          "status": "failed",
          "message": "Error in process update"
        }];
      }
    } else {
      return {
        "status": "failed",
        "message": "consultation process waiting can be done only when appointment is in progress."
      }
    }
  }
}
