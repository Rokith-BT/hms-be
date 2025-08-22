import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFrontOfficePurpose } from "./entities/setup_front_office_purpose.entity";

@Injectable()
export class SetupFrontOfficePurposeService {
  constructor(
    private readonly connection: DataSource,
        @InjectDataSource('AdminConnection')
        private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    purposeEntity: SetupFrontOfficePurpose,
  ): Promise<{ [key: string]: any }[]> {
   
    try {
      const result = await this.connection.query(
        'INSERT INTO visitors_purpose (visitors_purpose,description) VALUES (?,?)',
        [purposeEntity.visitors_purpose, purposeEntity.description],
      );

       await this.dynamicConnection.query(
        `INSERT INTO visitors_purpose (visitors_purpose,description,Hospital_id,hospital_visitors_purpose_id) VALUES (?,?,?,?)`,
        [
          purposeEntity.visitors_purpose,
          purposeEntity.description,

          purposeEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.PURPOSE_ADDED,
            inserted_data: await this.connection.query(
              'SELECT * FROM visitors_purpose WHERE id = ?',
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

  async findAll(): Promise<SetupFrontOfficePurpose[]> {
    try {
      const purpose = await this.connection.query(
        'SELECT * FROM visitors_purpose',
      );
      return purpose;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
    
  }

  async findOne(id: string): Promise<SetupFrontOfficePurpose | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM visitors_purpose WHERE id = ?',
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
      const purpose = await this.connection.query(
        'SELECT * FROM visitors_purpose WHERE id = ?',
        [id],
      );
  
        return purpose;
     
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
   
  }

  async update(
    id: string,
    purposeEntity: SetupFrontOfficePurpose,
  ): Promise<{ [key: string]: any }[]> {
    
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM visitors_purpose WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message: process.env.EXISTING_RECORD}];
    }

    try {
      await this.connection.query(
        'UPDATE visitors_purpose SET visitors_purpose =?, description = ? WHERE id = ?',
        [purposeEntity.visitors_purpose, purposeEntity.description, id],
      );

      await this.dynamicConnection.query(
        'update visitors_purpose SET visitors_purpose =?, description = ? where hospital_visitors_purpose_id = ?  and Hospital_id = ? ',
        [
          purposeEntity.visitors_purpose,
          purposeEntity.description,
          id,
          purposeEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.VISITOR_PURPOSE,
            updated_values: await this.connection.query(
              'SELECT * FROM visitors_purpose WHERE id = ?',
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
      'SELECT id FROM visitors_purpose WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }


    try {
      await this.connection.query(
        'DELETE FROM visitors_purpose WHERE id = ?',
        [id],
      );

      const [front_office_purpose] = await this.dynamicConnection.query(
        `select id from visitors_purpose where hospital_visitors_purpose_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from visitors_purpose where id = ? and Hospital_id = ?`,
        [front_office_purpose.id, Hospital_id],
      );
      return [
      {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.DELETED
      },
    ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }

  }

  async SetupFrontOfficePurpose(
    search: string,
  ): Promise<SetupFrontOfficePurpose[]> {
    let query = ` SELECT * FROM visitors_purpose `;
    let values = [];
    if (search) {
      query += ` WHERE ( visitors_purpose.visitors_purpose LIKE ? OR visitors_purpose.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupFrontOfficePurpose = await this.connection.query(final, values);
    return setupFrontOfficePurpose;
  }


  async findALLPURPOSE(limit:number,pagenumber:number){

    try {

      if(!limit){
        limit = 10;
      }
      if(!pagenumber){
        pagenumber = 1;
      }
  
      const offset = limit * (pagenumber - 1);
      
  
      const front_office_purpose = await this.connection.query(`select * FROM visitors_purpose LIMIT ? OFFSET ?`,
        [Number(limit),Number(offset)]
      );
  
      
      let [total_list] = await this.connection.query(`select count(id) as total from visitors_purpose`)
  
      return {
        
          status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.VISITOR_PURPOSE_FETCHED,
          data:front_office_purpose,
          total: total_list.total
  
  
        
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    
    }
  
    
    
  }

}
