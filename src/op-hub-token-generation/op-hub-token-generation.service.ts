import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TokenGeneration } from './entities/op-hub-token-generation.entity';

@Injectable()
export class OpHubTokenGenerationService {

  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
    private readonly eventEmitter: EventEmitter2,

  ) { }

  async create(createTokenGeneration: TokenGeneration) {
    try {

      const [staffId] = await this.connection.query('SELECT email FROM staff WHERE id = ?', [createTokenGeneration.staff_id]);
      const docemail = staffId.email;
      const hosStaff = await this.dynamicConnection.query('SELECT id FROM staff WHERE email = ?', [docemail]);
      const HosStaffId = hosStaff[0].id;
      const [getAdminShiftDetails] = await this.connection.query(`select * from doctor_shift where id = ?`, [createTokenGeneration.shift_id])
      const hosSHIFT = getAdminShiftDetails.hospital_doctor_shift_id;

      await this.dynamicConnection.query(`UPDATE appointment_queue AS aq
        JOIN (
            SELECT 
                appointment_queue.appointment_id AS appointment_id,
                ROW_NUMBER() OVER (ORDER BY appointment.time) AS position
            FROM 
                appointment_queue
            LEFT JOIN appointment ON appointment.id = appointment_queue.appointment_id
            WHERE 
                DATE(appointment_queue.date) = date(?) 
                AND appointment_queue.staff_id = ? 
                AND appointment_queue.shift_id = ?
        ) AS subquery ON aq.appointment_id = subquery.appointment_id
        SET aq.position = subquery.position;
        `,
        [
          createTokenGeneration.date,
          HosStaffId,
          hosSHIFT
        ]);
      await this.connection.query(`
        UPDATE appointment_queue AS aq
        JOIN (
            SELECT 
                appointment_queue.appointment_id AS appointment_id,
                ROW_NUMBER() OVER (ORDER BY appointment.time) AS position
            FROM 
                appointment_queue
            LEFT JOIN appointment ON appointment.id = appointment_queue.appointment_id
            WHERE 
                DATE(appointment_queue.date) = date(?) 
                AND appointment_queue.staff_id = ? 
                AND appointment_queue.shift_id = ?
        ) AS subquery ON aq.appointment_id = subquery.appointment_id
        SET aq.position = subquery.position;
        
        `, [
        createTokenGeneration.date,
        createTokenGeneration.staff_id,
        createTokenGeneration.shift_id
      ]);
      return [{
        "data ": {
          status: "success",
          "messege": "Token alloted successfully "
        }
      }];
    } catch (error) {
      return "error is : " + error;
    }
  }
}
