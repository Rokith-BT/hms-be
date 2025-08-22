import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OpHubCompleteAndCloseConsultationService {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(Hospital_id: number, appointment_number: string) {
    if (Hospital_id) {
      if (appointment_number) {
        try {
          let numb = appointment_number.replace(/[a-zA-Z]/g, '');
          const [getAdminAppointment_id] = await this.connection.query(
            ` select id from 
    appointment where hos_appointment_id = ?  and Hospital_id = ?`,
            [numb, Hospital_id],
          );

          await this.dynamicConnection.query(
            ` update appointment set 
       is_token_verified = 1 where id = ? `,
            [numb],
          );
          this.connection.query(
            ` update appointment set 
       is_token_verified = 1 where id = ? `,
            [getAdminAppointment_id.id],
          );

          await this.dynamicConnection.query(
            `update appointment set appointment_status_id = 5,appointment_status = 'InProcess'
        where id = ?`,
            [numb],
          );
          const [getAdminInprocessID] = await this.connection.query(
            `select id,status from appointment_status where hospital_id = ? and hos_appointment_status_id = ?`,
            [Hospital_id, 5],
          );
          this.connection.query(
            `update appointment set appointment_status_id = 5,appointment_status = 'InProcess'
          where id = ?`,
            [getAdminAppointment_id.id],
          );
          return {
            status: 'success',
            message: 'Token verified successfully',
          };
        } catch (error) {
          console.log('Error in findAll method:', error);

          return error;
        }
      } else {
        return {
          status: 'failed',
          message: 'enter appointment_number to verify token',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter hospital_id to to verify token',
      };
    }
  }

  async findAllcomplete(Hospital_id: number, appointment_number: string) {
    if (Hospital_id) {
      if (appointment_number) {
        try {
          let numb = appointment_number.replace(/[a-zA-Z]/g, '');
          const [getAdminAppointment_id] = await this.connection.query(
            ` select id from 
      appointment where hos_appointment_id = ?  and Hospital_id = ?`,
            [numb, Hospital_id],
          );

          await this.dynamicConnection.query(
            ` update appointment set 
         is_consultation_closed = 1 where id = ? `,
            [numb],
          );
          await this.connection.query(
            ` update appointment set 
         is_consultation_closed = 1 where id = ? `,
            [getAdminAppointment_id.id],
          );

          await this.dynamicConnection.query(
            `update appointment set appointment_status_id = 6,appointment_status = 'Completed'
          where id = ?`,
            [numb],
          );

          const [getAdmincompletedID] = await this.connection.query(
            `select id,status from appointment_status where hospital_id = ? and hos_appointment_status_id = ?`,
            [Hospital_id, 6],
          );
          await this.connection.query(
            `update appointment set appointment_status_id = 6,appointment_status = 'Completed'
            where id = ?`,
            [getAdminAppointment_id.id],
          );

          const [opd_id] = await this.dynamicConnection.query(
            `select visit_details.opd_details_id, visit_details.cons_doctor, appointment.case_reference_id from visit_details left join appointment on appointment.visit_details_id = visit_details.id where appointment.id = ?`,
            [numb],
          );

          const [admin_opd_id] = await this.connection.query(
            `select * from opd_details where hos_opd_id = ? and Hospital_id = ?`,
            [opd_id.opd_details_id, Hospital_id],
          );
          const [admin_cons_doc] = await this.connection.query(
            `select cons_doctor from visit_details where opd_details_id = ?`,
            [admin_opd_id.id],
          );
          const insertDischargeCard = await this.dynamicConnection.query(
            `insert into discharge_card 
            (case_reference_id, opd_details_id, discharge_by, discharge_date, 
            discharge_status, operation, 
            diagnosis, treatment_home) 
            values (?, ?, ?, date(now()), ?, ?, ?, ?)`,
            [
              opd_id.case_reference_id,
              opd_id.opd_details_id,
              opd_id.cons_doctor,
              '3',
              '',
              '',
              '',
            ],
          );
          await this.connection.query(
            `insert into discharge_card 
            (case_reference_id, opd_details_id, discharge_by, discharge_date, 
            discharge_status, operation, 
            diagnosis, treatment_home, Hospital_id, hospital_discharge_card_id) 
            values (?, ?, ?, date(now()), ?, ?, ?, ?, ?, ?)`,
            [
              admin_opd_id.case_reference_id,
              admin_opd_id.id,
              admin_cons_doc.cons_doctor,
              '3',
              '',
              '',
              '',
              Hospital_id,
              insertDischargeCard.insertId,
            ],
          );

          await this.dynamicConnection.query(
            `update opd_details set discharged = 'yes' where id = ?`,
            [opd_id.opd_details_id],
          );

          await this.connection.query(
            `update opd_details set discharged = 'yes' where id = ?`,
            [admin_opd_id.id],
          );

          return {
            status: 'success',
            message: 'consultation completed successfully',
          };
        } catch (error) {
          return error;
        }
      } else {
        return {
          status: 'failed',
          message: 'enter appointment_number to verify token',
        };
      }
    } else {
      return {
        status: 'failed',
        message: 'enter hospital_id to to verify token',
      };
    }
  }
}
