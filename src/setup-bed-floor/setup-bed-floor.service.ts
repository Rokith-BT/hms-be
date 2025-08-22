import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupBedFloor } from "./entities/setup-bed-floor.entity";
import {CountDto} from "./dto/setup-bed-floor.dto";

@Injectable()
export class SetupBedFloorService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(floorEntity: SetupBedFloor): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO floor (name,description) VALUES (?,?)',
        [floorEntity.name, floorEntity.description],
      );

      await this.dynamicConnection.query(
        'INSERT INTO floor(name,description,Hospital_id,hospital_floor_id) values (?,?,?,?)',
        [
          floorEntity.name,
          floorEntity.description,
          floorEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_FLOOR,
            inserted_data: await this.connection.query(
              'SELECT * FROM floor WHERE id = ?',
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
  async findAll(): Promise<SetupBedFloor[]> {
    try {
      const floor = await this.connection.query('SELECT * FROM floor');
      return floor;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:  process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR
      );

    }

  }
  async findOne(id: string): Promise<SetupBedFloor | null> {

    const [existingRecord] = await this.connection.query(`SELECT * FROM floor WHERE id = ?`, [id]);

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException({
        status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
      }, HttpStatus.NOT_FOUND);
    }

    try {
      const floor = await this.connection.query(
        'SELECT * FROM floor WHERE id = ?',
        [id],
      );
      return floor;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }


  async update(
    id: string,
    floorEntity: SetupBedFloor,
  ): Promise<{ [key: string]: any }[]> {


    const [existingRecord] = await this.connection.query(`SELECT id FROM floor WHERE id = ?`, [id]);

    if (!existingRecord) {
      return [
        {
          status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD
        },
      ];
    }
    try {
      await this.connection.query(
        'UPDATE floor SET name =?, description =? WHERE id = ?',
        [floorEntity.name, floorEntity.description, id],
      );

      await this.dynamicConnection.query(
        'update floor SET name =?, description =? where hospital_floor_id = ? and Hospital_id =?',
        [
          floorEntity.name,
          floorEntity.description,
          id,
          floorEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status:process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_FLOOR_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM floor WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {

      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:  process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM floor WHERE id = ?', [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }

    try {
      await this.connection.query(
        'DELETE FROM floor WHERE id = ?',
        [id],
      );
      const [bed_floor] = await this.dynamicConnection.query(
        `select id from floor where hospital_floor_id = ? `,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from floor where id = ? and Hospital_id = ?`,
        [bed_floor.id, Hospital_id],
      );
      return [
        {
          status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
 
  }

  async setupFloor(search: string): Promise<SetupBedFloor[]> {
    let query = ` SELECT * FROM floor `;
    let values = [];
    if (search) {
      query += ` WHERE ( floor.name LIKE ? OR floor.description LIKE ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupFloorSearch = await this.connection.query(final, values);
    return setupFloorSearch;
  }



  async findAllBedFloor(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Floor = await this.connection.query(
            `SELECT * FROM floor LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM floor`,
            );
 
      let out = {
        details: Floor,
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


  async findBedFloorSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `SELECT * FROM floor`;

      let countQuery = `SELECT COUNT(floor.id) AS total FROM floor`;

    if (search) {
      const condition = ` WHERE floor.name LIKE ? OR floor.description LIKE ? `;

      baseQuery += condition;
      countQuery += condition;

      const pattern = `%${search}%`;
      values.push(pattern, pattern);
    }

    baseQuery += ` ORDER BY floor.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];
  
      const BedFloorSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: BedFloorSearch,
        total: countResult.total ?? 0,
      };

    } catch (error) {
      throw new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message:  process.env.ERROR_MESSAGE,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
    }
  }


  

}
