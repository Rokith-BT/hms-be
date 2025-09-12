import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupHumanResourceDesignation } from './entities/setup-human_resource-designation.entity';
import {CountDto} from './dto/setup-human_resource-designation.dto';


@Injectable()
export class SetupHumanResourceDesignationService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    designationEntity: SetupHumanResourceDesignation,
  ): Promise<{ [key: string]: any }[]> {
    const [existingUnitType] = await this.connection.query(
      `SELECT id FROM staff_designation WHERE LOWER(TRIM(designation)) = LOWER(TRIM(?)) LIMIT 1`,
      [designationEntity.designation],
    );

    if (existingUnitType) {
      return [
        {
          status: process.env.DUPLICATE_NAME,
          message: process.env.DESIGNATION_EXIST,
        },
      ];
    }
    try {
      const result = await this.connection.query(
        'INSERT INTO staff_designation (designation,is_active) VALUES (?,?)',
        [designationEntity.designation, designationEntity.is_active],
      );

      await this.dynamicConnection.query(
        'INSERT INTO staff_designation(designation,is_active,Hospital_id,hospital_staff_designation_id) values (?,?,?,?)',
        [
          designationEntity.designation,
          designationEntity.is_active,
          designationEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.DESIGNATION,
            inserted_data: await this.connection.query(
              'SELECT * FROM staff_designation WHERE id = ?',
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

  async findAll(): Promise<SetupHumanResourceDesignation[]> {
    try {
      const staff_designation = await this.connection.query(
        'SELECT * FROM staff_designation',
      );
      return staff_designation;
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
  async findOne(id: string): Promise<SetupHumanResourceDesignation | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM staff_designation WHERE id = ?',
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
      const staff_designation = await this.connection.query(
        'SELECT * FROM staff_designation WHERE id = ?',
        [id],
      );
      return staff_designation;
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
    designationEntity: SetupHumanResourceDesignation,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM staff_designation WHERE id = ?',
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
        'UPDATE staff_designation SET designation =? WHERE id = ?',
        [designationEntity.designation, id],
      );
      await this.dynamicConnection.query(
        `update staff_designation SET designation = ? WHERE hospital_staff_designation_id = ? and Hospital_id = ?`,
        [designationEntity.designation, id, designationEntity.Hospital_id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.DESIGNATION_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM staff_designation WHERE id = ?',
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
    id: string,
    Hospital_id: string,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM staff_designation WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
         status:  process.env.ERROR,
        message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      if (Hospital_id) {
        try {
          await this.connection.query(
            'DELETE FROM staff_designation WHERE id = ?',
            [id],
          );
          await this.dynamicConnection.query(
            'delete from staff_designation where hospital_staff_designation_id = ? and Hospital_id = ?',
            [id, Hospital_id],
          );
          return [
            {
             "status":  process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
            },
          ];
        } catch (error) {
          return error;
        }
      } else {
        return [
          {
            status: process.env.ERROR_STATUS,
            message: process.env.HOSPITAL_ID_ERR_V2
          },
        ];
      }
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

  async HRDesignation(
    search: string,
  ): Promise<SetupHumanResourceDesignation[]> {
    let query = ` SELECT * FROM staff_designation `;
    let values = [];
    if (search) {
      query += ` WHERE ( staff_designation.designation LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupHRDesignationSearch = await this.connection.query(final, values);
    return setupHRDesignationSearch;
  }


  async findAllDesig(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const staff_designation = await this.connection.query(
            `SELECT * FROM staff_designation LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM staff_designation`,
            );
 
      let out = {
        details: staff_designation,
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



  async findDesignationsearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
        SELECT * FROM staff_designation `;
  
      let countQuery = `
        SELECT COUNT(staff_designation.id) AS total 
        FROM staff_designation `;

    if (search) {
      const condition = `
      WHERE staff_designation.designation LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }


    baseQuery += ` ORDER BY staff_designation.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const DesignationSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: DesignationSearch,
      total: countResult.total ?? 0,
    };
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




}
