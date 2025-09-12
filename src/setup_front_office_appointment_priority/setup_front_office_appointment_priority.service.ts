import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SetupFrontOfficeAppointmentPriority } from './entities/setup_front_office_appointment_priority.entity';

@Injectable()
export class SetupFrontOfficeAppointmentPriorityService {
  constructor(private readonly connection: DataSource
  ) { }

  async create(
    appointment_priority: SetupFrontOfficeAppointmentPriority,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO appoint_priority (priority_status) VALUES (?)',
        [appointment_priority.priority_status],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.APPOINTMENT_PRIORITY,
            inserted_data: await this.connection.query(
              'SELECT * FROM appoint_priority WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findAll() {
    try {
      const appoint_priority = await this.connection.query(
        'select id,priority_status from appoint_priority',
      );
      return appoint_priority;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findOne(id: number) {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_categories WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const appoint_priority = await this.connection.query(
        'select id,priority_status from appoint_priority where id = ?',
        [id],
      );
      return appoint_priority;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async update(
    id: number,
    appoint_priorityEntity: SetupFrontOfficeAppointmentPriority,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM appoint_priority WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message: process.env.EXISTING_RECORD}];
    }

    try {
      await this.connection.query(
        'update appoint_priority SET priority_status = ? where id = ?',
        [appoint_priorityEntity.priority_status, id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            message:process.env.APPOINTMENT_PRIORITY_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM appoint_priority WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<{ [key: string]: any }[]> {
    try {
      const [existingRecord] = await this.connection.query(
      'SELECT id FROM appoint_priority WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    await this.connection.query(
      'DELETE FROM appoint_priority WHERE id = ?',
      [id],
    );
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message:  process.env.DELETED
      },
    ];
    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  async setupFrontofficeAppointPriority(
    search: string,
  ): Promise<SetupFrontOfficeAppointmentPriority[]> {
    let query = ` SELECT * FROM appoint_priority `;
    let values = [];
    if (search) {
      query += ` WHERE ( appoint_priority.priority_status LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupAppointPrioritySearch = await this.connection.query(
      final,
      values,
    );
    return setupAppointPrioritySearch;
  }
}
