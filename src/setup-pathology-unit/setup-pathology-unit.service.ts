import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPathologyUnit } from "./entities/setup-pathology-unit.entity";
import {CountDto} from './dto/setup-pathology-unit.dto';


@Injectable()
export class SetupPathologyUnitService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(unitEntity: SetupPathologyUnit): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO unit (unit_name,unit_type) VALUES (?,?)',
        [unitEntity.unit_name, unitEntity.unit_type
        ]
      );
      await this.dynamicConnection.query('Insert into unit (unit_name,unit_type,Hospital_id,hospital_unit_id) Values (?,?,?,?)', [
        unitEntity.unit_name,
        unitEntity.unit_type,
        unitEntity.Hospital_id,
        result.insertId
      ])
      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.UNIT,
          "inserted_data": await this.connection.query('SELECT * FROM unit WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findAll(): Promise<SetupPathologyUnit[]> {
    try {
      const unit = await this.connection.query('SELECT * FROM unit where unit_type = ?', ['patho']);
    return unit;
    } catch (error) {
           throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }



  async update(id: string, unitEntity: SetupPathologyUnit): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query(
        'UPDATE unit SET unit_name =? WHERE id = ?',
        [unitEntity.unit_name,
          id
        ]
      );
      await this.dynamicConnection.query(
        'update unit SET unit_name = ? where hospital_unit_id = ? and Hospital_id = ?',
        [
          unitEntity.unit_name,
          id,
          unitEntity.Hospital_id
        ]
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.UNIT_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM unit WHERE id = ?', [id])
        }
      }];
    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {
   
    
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM unit WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    try {
       await this.connection.query('DELETE FROM unit WHERE id = ?', [id]);

      const [admin] = await this.dynamicConnection.query(`select id from unit where hospital_unit_id = ?`, [id])

      await this.dynamicConnection.query(`delete from unit where id = ? and Hospital_id = ?`, [
        admin.id,
        Hospital_id
      ])

    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
        }   
      return [{
      "status": process.env.SUCCESS_STATUS_V2,
      "message": process.env.DELETED
    }
    ];
  }



  async findPathologyUnitSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM unit WHERE unit_type = 'patho' `;

    let countQuery = `
      SELECT COUNT(unit.id) AS total FROM unit WHERE unit_type = 'patho' `;

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

    const PathologyUnitSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyUnitSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
        
    }
  }



  async findPathologyUnitsSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM unit WHERE unit_type = 'patho' `;

    let countQuery = `
      SELECT COUNT(unit.id) AS total FROM unit WHERE unit_type = 'patho' `;

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

    const PathologyUnitSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyUnitSearch,
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
