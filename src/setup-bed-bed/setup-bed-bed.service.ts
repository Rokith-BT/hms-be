import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupBedBed } from './entities/setup-bed-bed.entity';
import {CountDto} from './dto/setup-bed-bed.dto';

@Injectable()
export class SetupBedBedService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(bedEntity: SetupBedBed): Promise<{ [key: string]: any }[]> {
    try {
      const result = await this.connection.query(
        'INSERT INTO bed (name,bed_type_id,bed_group_id,is_active) VALUES (?,?,?,?)',
        [
          bedEntity.name,
          bedEntity.bed_type_id,
          bedEntity.bed_group_id,
          bedEntity.is_active,
        ],
      );

      const [bed_type] = await this.dynamicConnection.query(
        `select id from bed_type where Hospital_id = ? and hospital_bed_type_id = ?`,
        [bedEntity.Hospital_id, bedEntity.bed_type_id],
      );

      const [bed_group] = await this.dynamicConnection.query(
        `select id from bed_group where Hospital_id =? and hospital_bed_group_id = ?`,
        [bedEntity.Hospital_id, bedEntity.bed_group_id],
      );

      await this.dynamicConnection.query(
        'INSERT INTO bed (name,bed_type_id,bed_group_id,is_active,Hospital_id,hospital_bed_id) values (?,?,?,?,?,?) ',
        [
          bedEntity.name,
          bed_type.id,
          bed_group.id,
          bedEntity.is_active,
          bedEntity.Hospital_id,
          result.insertId,
        ],
      );
      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED,
            inserted_data: await this.connection.query(
              'SELECT * FROM bed WHERE id = ?',
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
  async findAll(): Promise<SetupBedBed[]> {
    try {
      const bed = await this.connection.query(
      "SELECT bed.id,bed.name, bed.is_active as used,bed.bed_type_id, bed_type.name as Bed_Type,bed.bed_group_id, CONCAT(bed_group.name, '-', floor.name) AS bed_group FROM bed left JOIN bed_type ON bed.bed_type_id = bed_type.id left JOIN bed_group ON bed.bed_group_id = bed_group.id left JOIN floor ON bed_group.floor = floor.id",
    );
    return bed;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }
  async findOne(id: string): Promise<SetupBedBed | null> {
    try {
       const bed = await this.connection.query(
      "SELECT bed.id, bed.name, bed.is_active as used, bed_type.name as Bed_Type, CONCAT(bed_group.name, '-', floor.name) AS bed_group FROM bed left JOIN bed_type ON bed.bed_type_id = bed_type.id left JOIN bed_group ON bed.bed_group_id = bed_group.id left JOIN floor ON bed_group.floor = floor.id WHERE bed.id = ?",
      [id],
    );
    if (bed.length === 1) {
      return bed;
    } else {
      return null;
    }
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }
  async update(
    id: string,
    bedEntity: SetupBedBed,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'UPDATE bed SET name =?, bed_type_id =?, bed_group_id =?, is_active =? WHERE id = ?',
        [
          bedEntity.name,
          bedEntity.bed_type_id,
          bedEntity.bed_group_id,
          bedEntity.is_active,
          id,
        ],
      );
      const [bed_type_id] = await this.dynamicConnection.query(
        `select id from bed_type where hospital_bed_type_id = ? and Hospital_id = ?`,
        [bedEntity.bed_type_id, bedEntity.Hospital_id],
      );

      const [bed_group_id] = await this.dynamicConnection.query(
        `select id from bed_group where hospital_bed_group_id = ? and Hospital_id = ?`,
        [bedEntity.bed_group_id, bedEntity.Hospital_id],
      );
      await this.dynamicConnection.query(
        'update bed SET  name =?, bed_type_id =?, bed_group_id =?, is_active =? where hospital_bed_id = ? and Hospital_id = ?',
        [
          bedEntity.name,
          bed_type_id.id,
          bed_group_id.id,
          bedEntity.is_active,
          id,
          bedEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BED_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM bed WHERE id = ?',
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
      await this.connection.query('DELETE FROM bed WHERE id = ?', [id]);

      const [bed] = await this.dynamicConnection.query(
        `select id from bed where hospital_bed_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from bed where id = ? and Hospital_id = ? `,
        [bed.id, Hospital_id],
      );
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      },
    ];
  }

  async setupBed(search: string): Promise<SetupBedBed[]> {
    let query = ` SELECT bed.id,bed.name, bed.is_active as used,bed.bed_type_id, bed_type.name as Bed_Type,bed.bed_group_id, CONCAT(bed_group.name, '-', floor.name) AS bed_group FROM bed JOIN bed_type ON bed.bed_type_id = bed_type.id JOIN bed_group ON bed.bed_group_id = bed_group.id JOIN floor ON bed_group.floor = floor.id `;
    let values = [];
    if (search) {
      query += ` WHERE ( bed.name LIKE ? OR bed_type.name LIKE ? OR CONCAT(bed_group.name, '-', floor.name) LIKE ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupBedSearch = await this.connection.query(final, values);
    return setupBedSearch;
  }

 

  async findAllBed(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Bed = await this.connection.query(
            `SELECT bed.id,bed.name, bed.is_active as used,bed.bed_type_id, bed_type.name as Bed_Type,bed.bed_group_id, CONCAT(bed_group.name, '-', floor.name) AS bed_group FROM bed left JOIN bed_type ON bed.bed_type_id = bed_type.id left JOIN bed_group ON bed.bed_group_id = bed_group.id left JOIN floor ON bed_group.floor = floor.id LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM bed`,
            );
 
      let out = {
        details: Bed,
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



  async findBedSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {
    const offset = limit * (page - 1);
    let values: any[] = [];
  
    try {
      let baseQuery = `
        SELECT bed.id,bed.name, bed.is_active as used,bed.bed_type_id, bed_type.name as Bed_Type,bed.bed_group_id, CONCAT(bed_group.name, '-', floor.name) AS bed_group FROM bed left JOIN bed_type ON bed.bed_type_id = bed_type.id left JOIN bed_group ON bed.bed_group_id = bed_group.id left JOIN floor ON bed_group.floor = floor.id
      `;
  
      let countQuery = `
        SELECT COUNT(bed.id) AS total 
        FROM bed 
        left JOIN bed_type ON bed.bed_type_id = bed_type.id 
        left JOIN bed_group ON bed.bed_group_id = bed_group.id 
        left JOIN floor ON bed_group.floor = floor.id
      `;
  
      if (search) {
        const condition = `
          WHERE bed.name LIKE ? OR bed_type.name LIKE ? OR CONCAT(bed_group.name, '-', floor.name) LIKE ? `;
  
        baseQuery += condition;
        countQuery += condition;
  
        const pattern = `%${search}%`;
        values.push(pattern, pattern, pattern);
      }
  
      baseQuery += ` ORDER BY bed.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];
  
      const BedSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);
  
      return {
        details: BedSearch,
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
