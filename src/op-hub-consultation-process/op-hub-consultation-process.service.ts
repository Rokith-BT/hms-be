import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Consultation } from './entities/op-hub-consultation-process.entity';

@Injectable()
export class OpHubConsultationProcessService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }


  async findAllColorCode(hospital_id: number) {

    if (hospital_id) {
      try {
      
        const query = `SELECT * FROM PT_constultation_process_color_code where id <> 4`;
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




  async findAllProcessList(hospital_id: number) {
    if (hospital_id) {
      try {
        const query = `SELECT * FROM PT_consultation_process_list`;


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



  async findAllProcessTrackList(hospital_id: number, appointment_id: string) {

    if (hospital_id) {
      if (appointment_id) {

        try {
          const query = `select concat("Dr. ",staff.name," ",staff.surname) doctor,
        PT_consultation_process_tracking.description,
        PT_consultation_process_list.process_name Consultation_Process,
        PT_constultation_process_color_code.color_code,
        PT_constultation_process_color_code.name status,
        concat(
        DATE_FORMAT(PT_consultation_process_tracking.created_at, '%D %b %Y')," ",
        DATE_FORMAT(PT_consultation_process_tracking.created_at, '%h:%i %p')) timing
        from PT_consultation_process_tracking
        left join staff on staff.id = PT_consultation_process_tracking.staff_id
        left join PT_consultation_process_list
        on PT_consultation_process_list.id = PT_consultation_process_tracking.consultaiton_process_list_id
        left join PT_constultation_process_color_code on PT_constultation_process_color_code.id = PT_consultation_process_tracking.consultation_process_color_code_id
        where PT_consultation_process_tracking.appointment_id = ?`;

          let numb
          try {

            numb = appointment_id.replace(/[a-zA-Z]/g, '')
          }
          catch (err) {
            numb = appointment_id
          }
          const appointmentStatusData = await this.dynamicConnection.query(query, [numb]);
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
    } else {
      return {
        status: "failed",
        message: "Enter hospital_id to get the values"
      };
    }
  }




  async update(updateconsultation: Consultation) {

    if (!updateconsultation.hospital_id) {
      return [{
        "status": "failed",
        "message": "Enter hospital_id to update prescription"
      }];
    }

    try {

      if (updateconsultation.appointment_id && updateconsultation.consultaiton_process_list_id) {

        let numb
        try {

          numb = updateconsultation.appointment_id.replace(/[a-zA-Z]/g, '')
        }
        catch (err) {
          numb = updateconsultation.appointment_id
        }

        const recordExistsQuery = `
              SELECT id
              FROM PT_consultation_process_tracking
              WHERE appointment_id = ? AND consultaiton_process_list_id = ?
          `;
        const [existingRecord] = await this.dynamicConnection.query(recordExistsQuery, [numb, updateconsultation.consultaiton_process_list_id]);



        if (existingRecord) {
          await this.dynamicConnection.query(`
                  UPDATE PT_consultation_process_tracking
                  SET 
                      consultation_process_color_code_id = ?,
                      description = ?
                  WHERE id = ?`,
            [
              updateconsultation.consultation_process_color_code_id,
              updateconsultation.description,
              existingRecord.id
            ]
          );


          const [admincolorcodeid] = await this.connection.query(`SELECT id FROM PT_constultation_process_color_code WHERE hospital_id = ? AND hos_constultation_process_color_code_id = ?`, [
            updateconsultation.hospital_id,
            updateconsultation.consultation_process_color_code_id
          ]);

          await this.connection.query(`
                  UPDATE PT_consultation_process_tracking
                  SET 
                      consultation_process_color_code_id = ?,
                      description = ?                      
                  WHERE hospital_id = ? and hos_consultation_process_tracking_id = ?`,
            [
              admincolorcodeid.id,
              updateconsultation.description,
              updateconsultation.hospital_id,
              existingRecord.id
            ]
          );

          return [{
            "status": "success",
            "message": "Prescription updated successfully"
          }];
        } else {
          const updateResult = await this.dynamicConnection.query(`
                  INSERT INTO PT_consultation_process_tracking
                      (patient_id, appointment_id, consultation_process_color_code_id, consultaiton_process_list_id, staff_id, description)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            [
              updateconsultation.patient_id,
              numb,
              updateconsultation.consultation_process_color_code_id,
              updateconsultation.consultaiton_process_list_id,
              updateconsultation.staff_id,
              updateconsultation.description
            ]
          );

          const [adminApptId] = await this.connection.query(`SELECT id FROM appointment WHERE Hospital_id = ? AND hos_appointment_id = ?`, [
            updateconsultation.hospital_id,
            numb
          ]);

          const [admincolorcodeid] = await this.connection.query(`SELECT id FROM PT_constultation_process_color_code WHERE hospital_id = ? AND hos_constultation_process_color_code_id = ?`, [
            updateconsultation.hospital_id,
            updateconsultation.consultation_process_color_code_id
          ]);

          const [adminprocesslistid] = await this.connection.query(`SELECT id FROM PT_consultation_process_list WHERE hospital_id = ? AND hos_PT_consultation_process_list_id = ?`, [
            updateconsultation.hospital_id,
            updateconsultation.consultaiton_process_list_id
          ]);

          const [staffId] = await this.dynamicConnection.query('SELECT email FROM staff WHERE id = ?', [updateconsultation.staff_id]);
          if (!staffId || staffId.length === 0) {
            throw new Error(`Staff with id: ${updateconsultation.staff_id} not found.`);
          }

          const docemail = staffId.email;

          const adminUpdateStaff = await this.connection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
          const adminStaffId = adminUpdateStaff[0].id;

          const hosPatient = await this.dynamicConnection.query(`SELECT * FROM patients WHERE id = ?`, [updateconsultation.patient_id]);
          const hosPatientMobileNo = hosPatient[0].mobileno;
          const hosTrimmedMobileNo = hosPatientMobileNo.length > 10 ? hosPatientMobileNo.startsWith('91') ? hosPatientMobileNo.slice(2) : hosPatientMobileNo : hosPatientMobileNo;

          let patientInAdmin;
          const patientQueryResult = await this.connection.query(`SELECT id, patient_name FROM patients WHERE mobileno IN (?, ?)`, [
            hosPatientMobileNo,
            hosTrimmedMobileNo
          ]);

          if (patientQueryResult && patientQueryResult.length > 0) {
            patientInAdmin = patientQueryResult[0];
          } else {
            console.error('No patient found with the given mobile number');
            return [{
              "status": "failed",
              "message": "No patient found with the given mobile number"
            }];
          }

          this.connection.query(`
                  INSERT INTO PT_consultation_process_tracking
                      (patient_id, appointment_id, consultation_process_color_code_id, consultaiton_process_list_id, staff_id, description, hospital_id, hos_consultation_process_tracking_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              patientInAdmin.id,
              adminApptId.id,
              admincolorcodeid.id,
              adminprocesslistid.id,
              adminStaffId,
              updateconsultation.description,
              updateconsultation.hospital_id,
              updateResult.insertId
            ]
          );

          return [{
            "status": "success",
            "message": "Prescription inserted successfully"
          }];
        }
      }
    } catch (error) {
      console.error('Error in prescription update:', error);
      return [{
        "status": "failed",
        "message": "Error in prescription update"
      }];
    }
  }




  async ProcessTrackHistory(hospital_id: number) {

    if (hospital_id) {
      try {

        const query = `SELECT * FROM PT_consultation_process_transaction_history`;
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




  async gettrackstats(hospital_id: number, appointment_id: string) {

    if (hospital_id) {
      if (appointment_id) {
        try {
          const query1 = `SELECT * FROM PT_constultation_process_color_code`;
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

          let numb: number
          try {

            numb = parseInt(appointment_id.replace(/[a-zA-Z]/g, ''))
          }
          catch (err) {
            numb = parseInt(appointment_id)
          }

          const consultationStatusData = await this.dynamicConnection.query(query, [numb, numb, numb, numb, numb, numb]);
          const appointmentStatusData = await this.dynamicConnection.query(query1);



          appointmentStatusData[0].count = consultationStatusData[0].waiting
          appointmentStatusData[1].count = consultationStatusData[0].ongoing
          appointmentStatusData[2].count = consultationStatusData[0].completed
          appointmentStatusData[3].count = consultationStatusData[0].notAttended


          return appointmentStatusData

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
