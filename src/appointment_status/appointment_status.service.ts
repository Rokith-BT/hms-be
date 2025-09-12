import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppointmentStatus } from './entities/appointment_status.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AppointmentStatusService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(AppointmentStatusEntity: AppointmentStatus) {
    try {
      const result = await this.connection.query(
        'insert into appointment_status (status,color_code) values (?,?)',
        [AppointmentStatusEntity.status, AppointmentStatusEntity.color_code],
      );

      await this.dynamicConnection.query(
        `Insert into appointment_status(status,color_code,hospital_id,hos_appointment_status_id) values (?,?,?,?)`,
        [
          AppointmentStatusEntity.status,
          AppointmentStatusEntity.color_code,
          AppointmentStatusEntity.hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          data: {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SUCCESS_MESSAGE_INSERT_V2,
            inserted_data: await this.connection.query(
              'SELECT * FROM appointment_status WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      const appointment_status = await this.connection.query(
        `select appointment_status.id as id, appointment_status.status as status, appointment_status.color_code 
from appointment_status`,
      );
      return appointment_status;
    }

    catch (error) {

      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findone(id: string) {
    try {
      const appointment_status = await this.connection.query(
        `select appointment_status.id as id, appointment_status.status as status, appointment_status.color_code 
from appointment_status where id = ?`,
        [id],
      );
      return appointment_status;
    }

    catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async update(id: number, AppointmentStatusEntity: AppointmentStatus) {

    try {
      await this.connection.query(
        `update appointment_status SET status = ?, color_code = ? WHERE id = ?`,
        [
          AppointmentStatusEntity.status,
          AppointmentStatusEntity.color_code,
          id,
        ],
      );

      await this.dynamicConnection.query(
        `update appointment_status SET  status = ?, color_code = ? where hos_appointment_status_id = ? and hospital_id = ?`,
        [
          AppointmentStatusEntity.status,
          AppointmentStatusEntity.color_code,
          id,
          AppointmentStatusEntity.hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.APPOINTMENT_STATUS,
            updated_values: await this.connection.query(
              'SELECT * FROM appointment_status WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllstatus() {
    try {
      const appointment_status = await this.connection.query(
        `select * from appointment_status`,
      );
      return appointment_status;
    }
    catch (error) {
      throw new HttpException({
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}
