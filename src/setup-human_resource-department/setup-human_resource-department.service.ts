import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupHumanResourceDepartment } from './entities/setup-human_resource-department.entity';
import { threadId } from 'worker_threads';
import {CountDto} from './dto/setup-human_resource-department.dto';

@Injectable()
export class SetupHumanResourceDepartmentService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    departmentEntity: SetupHumanResourceDepartment,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const [existingUnitType] = await this.connection.query(
        `SELECT id FROM department WHERE LOWER(TRIM(department_name)) = LOWER(TRIM(?)) LIMIT 1`,
        [departmentEntity.department_name],
      );

      if (existingUnitType) {
        return [
          {
           status: process.env.DUPLICATE_NAME,
            message: process.env.EXISTING_RECORD,
          },
        ];
      }

      const result = await this.connection.query(
        'INSERT INTO department (department_name,is_active) VALUES (?,?)',
        [departmentEntity.department_name, departmentEntity.is_active],
      );

      await this.dynamicConnection.query(
        'INSERT INTO department (department_name,is_active,Hospital_id,hospital_department_id) values (?,?,?,?)',
        [
          departmentEntity.department_name,
          departmentEntity.is_active,
          departmentEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.DEPARTMENT,
            inserted_data: await this.connection.query(
              'SELECT * FROM department WHERE id = ?',
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

  async findAll(): Promise<SetupHumanResourceDepartment[]> {
    try {
      const department = await this.connection.query(
        'SELECT * FROM department',
      );
      return department;
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

  async findOne(id: string): Promise<SetupHumanResourceDepartment | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM department WHERE id = ?',
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
      const department = await this.connection.query(
        'SELECT * FROM department WHERE id = ?',
        [id],
      );

      return department;
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
    departmentEntity: SetupHumanResourceDepartment,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM department WHERE id = ?',
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
        'UPDATE department SET department_name =? WHERE id = ?',
        [departmentEntity.department_name, id],
      );
      await this.dynamicConnection.query(
        'update department SET department_name = ? where hospital_department_id = ? and Hospital_id= ?',
        [departmentEntity.department_name, id, departmentEntity.Hospital_id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege:process.env.DEPARTMENT_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM department WHERE id = ?',
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
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM department WHERE id = ?',
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
          await this.connection.query('DELETE FROM department WHERE id = ?', [
            id,
          ]);
          const [depart] = await this.dynamicConnection.query(
            `select id from department where hospital_department_id = ? and Hospital_id = ?`,
            [id, Hospital_id],
          );
          await this.dynamicConnection.query(
            `delete from department where id = ? `,
            [depart.id],
          );
          return [
            {
              status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
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
      } else {
        return [
          {
            status: process.env.ERROR_STATUS,
            message: process.env.HOSPITAL_ID_ERR_V2,
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

  async HRDepartment(search: string): Promise<SetupHumanResourceDepartment[]> {
    let query = ` SELECT * FROM department `;
    let values = [];
    if (search) {
      query += ` WHERE ( department.department_name LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupHRDepartmentSearch = await this.connection.query(final, values);
    return setupHRDepartmentSearch;
  }


  async findAllDepart(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const staff_department = await this.connection.query(
            `SELECT * FROM department LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM department`,
            );
 
      let out = {
        details: staff_department,
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



  async findDepartmentsearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM department `;

    let countQuery = `
      SELECT COUNT(department.id) AS total 
      FROM department `;

    if (search) {

      const condition = `
      WHERE department.department_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);

    }

    baseQuery += ` ORDER BY department.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const DepartmentSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: DepartmentSearch,
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
