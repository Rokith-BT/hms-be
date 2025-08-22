import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupBedBedGroup } from './entities/setup-bed-bed_group.entity';
import {CountDto} from './dto/setup-bed-bed_group.dto';

@Injectable()
export class SetupBedBedGroupService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    bed_groupEntity: SetupBedBedGroup,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const [bed] = await this.connection.query(
        `select id from floor where id = ?`,
        [bed_groupEntity.floor],
      );
      if (!bed) {
        return [
          {
            status:  process.env.ERROR,
            message: `${process.env.FLOOR_ID} ${bed_groupEntity.floor} ${process.env.NOT_EXIST}`,
          },
        ];
      }

      const result = await this.connection.query(
        'INSERT INTO bed_group (name,color,description,floor,is_active) VALUES (?,?,?,?,?)',
        [
          bed_groupEntity.name,
          bed_groupEntity.color,
          bed_groupEntity.description,
          bed.id,
          bed_groupEntity.is_active,
        ],
      );

      const [admin_bed] = await this.dynamicConnection.query(
        `select id from floor where hospital_floor_id = ? and Hospital_id = ?`,
        [bed_groupEntity.floor, bed_groupEntity.Hospital_id],
      );

      await this.dynamicConnection.query(
        'INSERT INTO bed_group (name,color,description,floor,is_active,Hospital_id,hospital_bed_group_id) VALUES (?,?,?,?,?,?,?)',
        [
          bed_groupEntity.name,
          bed_groupEntity.color,
          bed_groupEntity.description,
          admin_bed.id,
          bed_groupEntity.is_active,
          bed_groupEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_GROUP ,
            inserted_data: await this.connection.query(
              'SELECT * FROM bed_group WHERE id = ?',
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

  async findAll(): Promise<SetupBedBedGroup[]> {
    try {
      const bed_group = await this.connection.query(
        'SELECT bed_group.id, bed_group.name, floor.name AS floor_name, bed_group.description, bed_group.color, bed_group.is_active  FROM bed_group  JOIN floor ON bed_group.floor = floor.id',
      );
      return bed_group;
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

  async findOne(id: string): Promise<SetupBedBedGroup | null> {
    const [existingRecord] = await this.dynamicConnection.query(
      'SELECT * FROM bed_group WHERE hospital_bed_group_id = ?',
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
      const bed_group = await this.connection.query(
        `SELECT bed_group.id, bed_group.name, floor.name AS floor_name, 
        bed_group.description, bed_group.color, bed_group.is_active 
         FROM bed_group  JOIN floor ON bed_group.floor = floor.id 
         WHERE bed_group.id = ?`,
        [id],
      );

      return bed_group;
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
    bed_groupEntity: SetupBedBedGroup,
  ): Promise<{ [key: string]: any }[]> {
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM bed_group WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [
        {
          status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD ,
        },
      ];
    }

    const [bed] = await this.connection.query(
      `select id from floor where id = ?`,
      [bed_groupEntity.floor],
    );
    if (!bed) {
      return [
        {
          status:  process.env.ERROR,
          message: `${process.env.FLOOR_ID} ${bed_groupEntity.floor} ${process.env.NOT_EXIST}`,
        },
      ];
    }

    try {
      await this.connection.query(
        'UPDATE bed_group SET name =? , color =? , description =? , floor =? WHERE id = ?',
        [
          bed_groupEntity.name,
          bed_groupEntity.color,
          bed_groupEntity.description,
          bed.id,
          id,
        ],
      );

      const [admin_bed] = await this.dynamicConnection.query(
        `select id from floor where hospital_floor_id = ? and Hospital_id = ?`,
        [bed_groupEntity.floor, bed_groupEntity.Hospital_id],
      );

      await this.dynamicConnection.query(
        'update bed_group SET  name =? , color =? , description =? , floor =? where hospital_bed_group_id = ? and Hospital_id = ?',
        [
          bed_groupEntity.name,
          bed_groupEntity.color,
          bed_groupEntity.description,
          admin_bed.id,
          id,
          bed_groupEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_GROUP_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM bed_group WHERE id = ?',
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
      `SELECT id FROM bed_group WHERE id = ?`,
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
      await this.connection.query('DELETE FROM bed_group WHERE id = ?', [id]);
      const [bed_group] = await this.dynamicConnection.query(
        `select id from bed_group where hospital_bed_group_id = ?`,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from bed_group where id = ? and Hospital_id = ?`,
        [bed_group.id, Hospital_id],
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
  }

  async setupBedGroup(search: string): Promise<SetupBedBedGroup[]> {
    let query = ` SELECT bed_group.id, bed_group.name, floor.name AS floor_name, bed_group.description, bed_group.color, bed_group.is_active  FROM bed_group  JOIN floor ON bed_group.floor = floor.id `;
    let values = [];
    if (search) {
      query += ` WHERE ( bed_group.name LIKE ? OR floor.name LIKE ? OR bed_group.description LIKE ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupBedGroupSearch = await this.connection.query(final, values);
    return setupBedGroupSearch;
  }

 

  async findAllBedGroup(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Bed_group = await this.connection.query(
            `SELECT bed_group.id, bed_group.name, floor.name AS floor_name, 
            bed_group.description, bed_group.color, bed_group.is_active  FROM bed_group 
             JOIN floor ON bed_group.floor = floor.id LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM bed_group`,
            );
 
      let out = {
        details: Bed_group,
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



  async findBedgroupSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];
  
    try {
      let baseQuery = `
        SELECT bed_group.id, bed_group.name, floor.name AS floor_name, 
               bed_group.description, bed_group.color, bed_group.is_active  
        FROM bed_group  
        JOIN floor ON bed_group.floor = floor.id
      `;
  
      let countQuery = `
        SELECT COUNT(bed_group.id) AS total 
        FROM bed_group 
        JOIN floor ON bed_group.floor = floor.id
      `;
  
      if (search) {
        const condition = `
          WHERE bed_group.name LIKE ? 
          OR floor.name LIKE ? 
          OR bed_group.description LIKE ? `;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        values.push(pattern, pattern, pattern);
      }
  
      baseQuery += ` ORDER BY bed_group.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];
  
      const BedGroupSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: BedGroupSearch,
        total: countResult.total ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  


}
