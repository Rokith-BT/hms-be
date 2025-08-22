import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupBedBedType } from './entities/setup-bed-bed_type.entity';
import {CountDto} from './dto/setup-bed-bed_type.dto';

@Injectable()
export class SetupBedBedTypeService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    bed_typeEntity: SetupBedBedType,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const result = await this.connection.query(
        'INSERT INTO bed_type (name) VALUES (?)',
        [bed_typeEntity.name],
      );

      await this.dynamicConnection.query(
        'INSERt INTO bed_type (name,Hospital_id,hospital_bed_type_id) values (?,?,?)',
        [bed_typeEntity.name, bed_typeEntity.Hospital_id, result.insertId],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status:process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_TYPE,
            inserted_data: await this.connection.query(
              'SELECT * FROM bed_type WHERE id = ?',
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

  async findAll(): Promise<SetupBedBedType[]> {
    try {
      const bed_type = await this.connection.query('SELECT * FROM bed_type');
      return bed_type;
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
  async findOne(id: string): Promise<SetupBedBedType | null> {
    const [existingRecord] = await this.connection.query(
      'SELECT * FROM bed_type WHERE id = ?',
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
      const bed_type = await this.connection.query(
        'SELECT * FROM bed_type WHERE id = ?',
        [id],
      );
      return bed_type;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: string,
    bed_typeEntity: SetupBedBedType,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM bed_type WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [
        {
          status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD 
        },
      ];
    }

    try {
      await this.connection.query('UPDATE bed_type SET name =? WHERE id = ?', [
        bed_typeEntity.name,
        id,
      ]);

      await this.dynamicConnection.query(
        'update bed_type SET name =? where hospital_bed_type_id = ? and Hospital_id= ?',

        [bed_typeEntity.name, id, bed_typeEntity.Hospital_id],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_TYPE_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM bed_type WHERE id = ?',
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
      'SELECT id FROM bed_type WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [
        {
           status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD 
        },
      ];
    }

    try {
      await this.connection.query('DELETE FROM bed_type WHERE id = ?', [id]);

      const [admin] = await this.dynamicConnection.query(
        `select id from bed_type where hospital_bed_type_id = ?`,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from bed_type where id = ? and Hospital_id = ?`,
        [admin.id, Hospital_id],
      );
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return [
      {
        status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
      },
    ];
  }

  async setupBedType(search: string): Promise<SetupBedBedType[]> {
    let query = ` SELECT * FROM bed_type `;
    let values = [];
    if (search) {
      query += ` WHERE ( bed_type.name LIKE ? ) `;
      values.push('%' + search + '%');
    }
    let final = query;

    const setupBedTypeSearch = await this.connection.query(final, values);

    return setupBedTypeSearch;
  }


  async findAllBedType(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Bed_type = await this.connection.query(
            `SELECT * FROM bed_type LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM bed_type`,
            );
 
      let out = {
        details: Bed_type,
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


  async findBedTypeSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `SELECT * FROM bed_type`;

      let countQuery = `SELECT COUNT(bed_type.id) AS total FROM bed_type`;

    if (search) {
      const condition = ` WHERE bed_type.name LIKE ? `;

      baseQuery += condition;
      countQuery += condition;

      const pattern = `%${search}%`;
      values.push(pattern);
    }

    baseQuery += ` ORDER BY bed_type.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];
  
      const BedTypeSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: BedTypeSearch,
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
