import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupHumanResourceLeaveType } from './entities/setup-human_resource-leave_type.entity';
import {CountDto} from './dto/setup-human_resource-leave_types.dto';

@Injectable()
export class SetupHumanResourceLeaveTypesService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    leavetypesEntity: SetupHumanResourceLeaveType,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const [existingUnitType] = await this.connection.query(
        `SELECT id FROM leave_types WHERE LOWER(TRIM(type)) = LOWER(TRIM(?)) LIMIT 1`,
        [leavetypesEntity.type],
      );

      if (existingUnitType) {
        return [
          {
            status: process.env.DUPLICATE_NAME,
            message: process.env.LEAVE_TYPE_EXIST,
          },
        ];
      }

      const result = await this.connection.query(
        'INSERT INTO leave_types (type,is_active) VALUES (?,?)',
        [leavetypesEntity.type, leavetypesEntity.is_active],
      );
      await this.dynamicConnection.query(
        `INSERT into leave_types (type,is_active,Hospital_id,hospital_leave_types_id) values (?,?,?,?)`,
        [
          leavetypesEntity.type,
          leavetypesEntity.is_active,
          leavetypesEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.LEAVE_TYPE,
            inserted_data: await this.connection.query(
              'SELECT * FROM leave_types WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<SetupHumanResourceLeaveType[]> {
    try {
      const leave_types = await this.connection.query(
        'SELECT * FROM leave_types',
      );
      return leave_types;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<SetupHumanResourceLeaveType | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM leave_types WHERE id = ?',
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
      const leave_types = await this.connection.query(
        'SELECT * FROM leave_types WHERE id = ?',
        [id],
      );

      return leave_types;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    leavetypesEntity: SetupHumanResourceLeaveType,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM leave_types WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
         status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.connection.query(
        'UPDATE leave_types SET type =? WHERE id = ?',
        [leavetypesEntity.type, id],
      );

      await this.dynamicConnection.query(
        'update leave_types SET type =? where hospital_leave_types_id =? and Hospital_id= ?',

        [leavetypesEntity.type, id, leavetypesEntity.Hospital_id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.LEAVE_TYPE_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM leave_types WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(
    id: number,
    Hospital_id: string,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM leave_types WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [
        {
          status:  process.env.ERROR,
        message: process.env.EXISTING_RECORD,
        },
      ];
    }

    try {
      await this.connection.query('DELETE FROM leave_types WHERE id = ?', [id]);

      const [deleteadmin] = await this.dynamicConnection.query(
        `select id from leave_types where hospital_leave_types_id = ? and Hospital_id = ?`,
        [id, Hospital_id],
      );

      await this.dynamicConnection.query(
        `delete from leave_types where id = ?`,
        [deleteadmin.id],
      );

      return [
        {
         "status":  process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async HRLeaveTypes(search: string): Promise<SetupHumanResourceLeaveType[]> {
    let query = ` SELECT * FROM leave_types `;
    let values = [];
    if (search) {
      query += ` WHERE ( leave_types.type LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupHRLeaveTypeSearch = await this.connection.query(final, values);
    return setupHRLeaveTypeSearch;
  }



  async findAllLeaveTypes(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Leave_Types = await this.connection.query(
            `SELECT * FROM leave_types LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM leave_types`,
            );
 
      let out = {
        details: Leave_Types,
        total: total_list.total,
      };
      return out;
    } catch (error) {
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: process.env.ERROR_MESSAGE,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }


  async findLeaveTypesearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM leave_types `;

    let countQuery = `
      SELECT COUNT(leave_types.id) AS total 
      FROM leave_types `;

    if (search) {

      const condition = `
      WHERE leave_types.type LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY leave_types.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const LeaveTypesSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: LeaveTypesSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      console.log(error,'errr')
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: process.env.ERROR_MESSAGE,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }


}
