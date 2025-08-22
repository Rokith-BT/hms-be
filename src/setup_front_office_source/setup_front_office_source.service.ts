import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFrontOfficeSource } from "./entities/setup_front_office_source.entity";

@Injectable()
export class SetupFrontOfficeSourceService {
  constructor(
   private readonly connection: DataSource,
       @InjectDataSource('AdminConnection')
       private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    sourceEntity: SetupFrontOfficeSource,
  ): Promise<{ [key: string]: any }[]> {
    
    try {
      const result = await this.connection.query(
        'INSERT INTO source (source,description) VALUES (?,?)',
        [sourceEntity.source, sourceEntity.description],
      );

       await this.dynamicConnection.query(
        `INSERT INTO source (source,description,Hospital_id,hospital_source_id) values(?,?,?,?)`,
        [
          sourceEntity.source,
          sourceEntity.description,
          sourceEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege:process.env.SOURCE_ADDED ,
            inserted_data: await this.connection.query(
              'SELECT * FROM source WHERE id = ?',
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

  async findAll(): Promise<SetupFrontOfficeSource[]> {
    try {
      const source = await this.connection.query('SELECT * FROM source');
      return source;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findOne(id: string): Promise<SetupFrontOfficeSource | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM source WHERE id = ?',
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
      const source = await this.connection.query(
        'SELECT * FROM source WHERE id = ?',
        [id],
      );
      if (source.length === 1) {
        return source;
      } else {
        return null;
      }
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);      }
  }

  async update(
    id: string,
    sourceEntity: SetupFrontOfficeSource,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM source WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD }];
    }
    
    try {
       await this.connection.query(
        'UPDATE source SET source =?, description = ? WHERE id = ?',
        [sourceEntity.source, sourceEntity.description, id],
      );

     await this.dynamicConnection.query(
        'update source SET  source =?, description = ? where hospital_source_id = ? and Hospital_id = ? ',
        [
          sourceEntity.source,
          sourceEntity.description,
          id,
          sourceEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SOURCE_UPDATED ,
            updated_values: await this.connection.query(
              'SELECT * FROM source WHERE id = ?',
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

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM source WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }
   
    try {
      const result = await this.connection.query(
        'DELETE FROM source WHERE id = ?',
        [id],
      );
      const [source] = await this.dynamicConnection.query(
        `select id from source where hospital_source_id = ?`,
        [id],
      );
      await this.dynamicConnection.query(
        `delete from source where id = ? and Hospital_id = ?`,
        [source.id, Hospital_id],
      );
   
    return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message:  process.env.DELETED
      },
    ];
  }   catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  
  } 

}

  async setupFrontofficeSource(
    search: string,
  ): Promise<SetupFrontOfficeSource[]> {
    let query = ` SELECT * FROM source `;
    let values = [];
    if (search) {
      query += ` WHERE ( source.source LIKE ? OR source.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupFrontOfficeSource = await this.connection.query(final, values);
    return setupFrontOfficeSource;
  }


  async finadallsource(limit:number,pagenumber:number){
    try {
      
      if(!limit){
        limit = 10;
      }
      if(!pagenumber){
        pagenumber = 1;
      }

    const offset = limit * (pagenumber - 1);

    const source = await this.connection.query('SELECT * FROM source LIMIT ? OFFSET ?',
      [Number(limit),Number(offset)]
    );

    let [total_list] = await this.connection.query(`SELECT count(id) as total from source `)
    return {
      status:  process.env.SUCCESS_STATUS_V2,
      message: process.env.SOURCE_FETCHED,
      data: source,
      total: total_list.total
    };

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);  
    }
  }
}
