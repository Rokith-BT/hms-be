import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupHumanResourceSpecialist } from './entities/setup-human_resource-specialist.entity';
import {CountDto} from './dto/setup-human_resource-specialist.dto'

@Injectable()
export class SetupHumanResourceSpecialistService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(specialsitEntity: SetupHumanResourceSpecialist) {
    const [existingspecialist] = await this.connection.query(
      `SELECT id FROM specialist WHERE LOWER(TRIM(specialist_name)) = LOWER(TRIM(?)) LIMIT 1`,
      [specialsitEntity.specialist_name],
    );

    if (existingspecialist) {
      return [
        {
          status:  process.env.DUPLICATE_NAME,
          message: process.env.SPECIALIST_EXIST,
        },
      ];
    }

    try {
      const result = await this.connection.query(
        'INSERT INTO specialist (specialist_name,is_active) VALUES (?,"yes")',
        [specialsitEntity.specialist_name],
      );
      try {
        await this.dynamicConnection.query(
          `INSERT INTO specialist (specialist_name,is_active,Hospital_id,hospital_specialist_id) VALUES (?,"yes",?,?)`,
          [
            specialsitEntity.specialist_name,
            specialsitEntity.Hospital_id,
            result.insertId,
          ],
        );
      } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);      }

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SPECIALIST,
            inserted_data: await this.connection.query(
              'SELECT * FROM specialist WHERE id = ?',
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

  async findAll(): Promise<SetupHumanResourceSpecialist[]> {
    try {
      const specialsist = await this.connection.query(
        'SELECT * FROM specialist',
      );
      return specialsist;
    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<SetupHumanResourceSpecialist | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM specialist WHERE id = ?',
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
      const specialsist = await this.connection.query(
        'SELECT * FROM specialist WHERE id = ?',
        [id],
      );

      return specialsist;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    id: string,
    specialsitEntity: SetupHumanResourceSpecialist,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM specialist WHERE id = ?',
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
        'UPDATE specialist SET specialist_name =? WHERE id = ?',
        [specialsitEntity.specialist_name, id],
      );
      await this.dynamicConnection.query(
        'update specialist SET specialist_name =? where hospital_specialist_id = ? and Hospital_id =?',
        [specialsitEntity.specialist_name, id, specialsitEntity.Hospital_id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SPECIALIST_UPDATE,
            updated_values: await this.connection.query(
              'SELECT * FROM specialist WHERE id = ?',
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

  async remove(
    id: string,
    Hospital_id: string,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM specialist WHERE id = ?',
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
          await this.connection.query('DELETE FROM specialist WHERE id = ?', [
            id,
          ]);
          await this.dynamicConnection.query(
            'delete from specialist where hospital_specialist_id = ? and Hospital_id = ?',
            [id, Hospital_id],
          );
          return [
            {
              "status":  process.env.SUCCESS_STATUS_V2,
              "message": process.env.DELETED
            },
          ];
        } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);        }
      } else {
        return [
          {
            status: process.env.ERROR_STATUS,
            message: process.env.HOSPITAL_ID_ERR_V2,
          },
        ];
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async HRSpecialist(search: string): Promise<SetupHumanResourceSpecialist[]> {
    let query = ` SELECT * FROM specialist `;
    let values = [];

    if (search) {
      query += ` WHERE ( specialist.specialist_name LIKE ? )  `;
      values.push('%' + search + '%');
    }

    let final = query;

    const setupHRSpecialistSearch = await this.connection.query(final, values);

    return setupHRSpecialistSearch;
  }



  async findAllSpec(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Specialist = await this.connection.query(
            `SELECT * FROM specialist LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM specialist`,
            );
 
      let out = {
        details: Specialist,
        total: total_list.total,
      };
      return out;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findSpecialistsearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM specialist `;

    let countQuery = `
      SELECT COUNT(specialist.id) AS total 
      FROM specialist `;

    if (search) {

      const condition = `
      WHERE specialist.specialist_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY specialist.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const SpecialistSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: SpecialistSearch,
      total: countResult.total ?? 0,
    };

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
