import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupRadiologyUnit } from "./entities/setup-radiology-unit.entity";
import {CountDto} from './dto/setup-radiology-unit.dto';


@Injectable()
export class SetupRadiologyUnitService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(unitEntity: SetupRadiologyUnit) {
    try {

      const [existingradiologyunit] = await this.connection.query(`
        SELECT id FROM unit WHERE unit_name = ? AND unit_type = 'radio' LIMIT 1`,
      [unitEntity.unit_name]);
      if (existingradiologyunit) {
        return [
          {
            status: process.env.DUPLICATE_NAME,
            message: process.env.EXISTING_RECORD,
          },
        ];
      }

      const result = await this.connection.query(
        'INSERT INTO unit (unit_name,unit_type) VALUES (?,?)',
        [unitEntity.unit_name, unitEntity.unit_type],
      );

      await this.dynamicConnection.query(
        `INSERT INTO unit (unit_name,unit_type,Hospital_id,hospital_unit_id) VALUES (?,?,?,?)`,
        [
          unitEntity.unit_name,
          unitEntity.unit_type,
          unitEntity.Hospital_id,
          result.insertId,
        ],
      );
      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.UNIT,
            inserted_data: await this.connection.query(
              'SELECT * FROM unit WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findOne(): Promise<SetupRadiologyUnit | null> {
    try {
      const unit = await this.connection.query(
        'SELECT * FROM unit WHERE unit_type = ?',
        ['radio'],
      );

      return unit;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    id: string,
    unitEntity: SetupRadiologyUnit,
  ): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query(
        'UPDATE unit SET unit_name =? WHERE id = ?',
        [unitEntity.unit_name, id],
      );

      await this.dynamicConnection.query(
        'update unit SET unit_name = ? where hospital_unit_id = ? and Hospital_id= ?',
        [unitEntity.unit_name, id, unitEntity.Hospital_id],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.UNIT_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM unit WHERE id = ?',
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
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query(
        'DELETE FROM unit WHERE id = ?',
        [id],
      );

      const [admin] = await this.dynamicConnection.query(
        `select id from unit where hospital_unit_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from unit where id = ? and Hospital_id = ?`,
        [admin.id, Hospital_id],
      );
    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
    return [
      {
        status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
      },
    ];
  }

  async findRadiologyUnitSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM unit WHERE unit_type = 'radio' `;

    let countQuery = `
      SELECT COUNT(unit.id) AS total FROM unit WHERE unit_type = 'radio' `;

    if (search) {

      const condition = `
      and ( unit.unit_name LIKE ? ) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY unit.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyUnitSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyUnitSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findRadiologyUnitsSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM unit WHERE unit_type = 'radio' `;

    let countQuery = `
      SELECT COUNT(unit.id) AS total FROM unit WHERE unit_type = 'radio' `;

    if (search) {

      const condition = `
      and ( unit.unit_name LIKE ? ) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY unit.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyUnitSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyUnitSearch,
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
