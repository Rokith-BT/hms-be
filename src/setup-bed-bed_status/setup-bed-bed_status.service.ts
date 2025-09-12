import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {CountDto} from './dto/setup-bed-bed_status.dto';

@Injectable()
export class SetupBedBedStatusService {
  constructor(private readonly connection: DataSource) {}

  async findAll(): Promise<SetupBedBedStatusService[]> {
    try {
      const bed_status = await this.connection
        .query(`select bed.id, bed.name,bed.is_active as status,bed_type.name AS bed_type,bed_group.name AS bed_group,
    floor.name As floor from bed join bed_type ON bed.bed_type_id = bed_type.id join bed_group ON bed.bed_group_id = bed_group.id  
    left join floor on bed_group.floor = floor.id;`);
      return bed_status;
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

  async findOne(id: string): Promise<SetupBedBedStatusService | null> {
   

      const [existingRecord] = await this.connection.query(`
        SELECT id FROM bed where id = ?`,[id]);

        if(!existingRecord || existingRecord.length === 0) {
          throw new HttpException(
            {
              status: process.env.IDENTITY,
              message: process.env.EXISTING_RECORD,
            },
            HttpStatus.NOT_FOUND,
          )
        }
 try {
      const bed_status = await this.connection.query(
        `select bed.id, bed.name,bed.is_active as status,bed_type.name AS bed_type,bed_group.name AS bed_group,
      floor.name As floor from bed join bed_type ON bed.bed_type_id = bed_type.id join bed_group ON bed.bed_group_id = bed_group.id  
      left join floor on bed_group.floor = floor.id WHERE bed.id = ?`,
        [id],
      );

      return bed_status;
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

  async setupBedStatus(search: string): Promise<SetupBedBedStatusService[]> {
    let query = ` select bed.id, bed.name,bed.is_active as status,bed_type.name AS bed_type,bed_group.name AS bed_group,
    floor.name As floor from bed join bed_type ON bed.bed_type_id = bed_type.id join bed_group ON bed.bed_group_id = bed_group.id  
    left join floor on bed_group.floor = floor.id `;
    let values = [];

    if (search) {
      query += ` WHERE ( bed.name LIKE ? OR bed_type.name LIKE ? OR bed_group.name LIKE ? OR floor.name LIKE ? OR bed.is_active LIKE ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }

    let final = query;

    const setupBedStatusSearch = await this.connection.query(final, values);

    return setupBedStatusSearch;
  }


  async findAllBedStatus(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const BedStatus = await this.connection.query(
            `select bed.id, bed.name,bed.is_active as status,bed_type.name AS bed_type,bed_group.name AS bed_group,
    floor.name As floor from bed join bed_type ON bed.bed_type_id = bed_type.id join bed_group ON bed.bed_group_id = bed_group.id  
    left join floor on bed_group.floor = floor.id LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM bed`,
            );
 
      let out = {
        details: BedStatus,
        total: total_list.total,
      };
      return out;
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



  async findBedStatusSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];
  
    try {
      let baseQuery = `
        select bed.id, bed.name,bed.is_active as status,bed_type.name AS bed_type,bed_group.name AS bed_group,
    floor.name As floor from bed join bed_type ON bed.bed_type_id = bed_type.id join bed_group ON bed.bed_group_id = bed_group.id  
    left join floor on bed_group.floor = floor.id
      `;
  
      let countQuery = `
        SELECT COUNT(bed.id) AS total 
        FROM bed 
        join bed_type ON bed.bed_type_id = bed_type.id 
        join bed_group ON bed.bed_group_id = bed_group.id  
        left join floor on bed_group.floor = floor.id
      `;
  
      if (search) {
        const condition = `
          WHERE bed.name LIKE ? OR bed_type.name LIKE ? OR bed_group.name LIKE ? OR floor.name LIKE ? OR bed.is_active LIKE ? `;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        values.push(pattern, pattern, pattern, pattern, pattern);
      }
  
      baseQuery += ` ORDER BY bed.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];
  
      const BedStatusSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: BedStatusSearch,
        total: countResult.total ?? 0,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:  process.env.ERROR_MESSAGE,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
