import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupFrontOfficeComplainType } from "./entities/setup_front_office_complain_type.entity";


@Injectable()
export class SetupFrontOfficeComplainTypeService {
  constructor(
   private readonly connection: DataSource,
       @InjectDataSource('AdminConnection')
       private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    complain_typeEntity: SetupFrontOfficeComplainType,
  ): Promise<{ [key: string]: any }[]> {
    
    try {
      const result = await this.connection.query(
        'INSERT INTO complaint_type (complaint_type,description) VALUES (?,?)',
        [complain_typeEntity.complaint_type, complain_typeEntity.description],
      );

       await this.dynamicConnection.query(
        'INSERT INTO complaint_type (complaint_type,description,Hospital_id,hospital_complaint_type_id) VALUES (?,?,?,?)',
        [
          complain_typeEntity.complaint_type,
          complain_typeEntity.description,
          complain_typeEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.COMPLAINT_TYPE,
            inserted_data: await this.connection.query(
              'SELECT * FROM complaint_type WHERE id = ?',
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

  async findAll(): Promise<SetupFrontOfficeComplainType[]> {
    try {
      const complaint_type = await this.connection.query(
        'SELECT * FROM complaint_type',
      );
      return complaint_type;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }
  async findOne(id: string): Promise<SetupFrontOfficeComplainType | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM complaint_type WHERE id = ?',
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
      const complaint_type = await this.connection.query(
        'SELECT * FROM complaint_type WHERE id = ?',
        [id],
      );
      return complaint_type;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
    
  }

  async update(
    id: string,
    complain_typeEntity: SetupFrontOfficeComplainType,
  ): Promise<{ [key: string]: any }[]> {
    
    const [existingRecord] = await this.connection.query(
      'SELECT id FROM complaint_type WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message:  process.env.EXISTING_RECORD }];
    }

    try {
       await this.connection.query(
        'UPDATE complaint_type SET complaint_type =?, description = ? WHERE id = ?',
        [
          complain_typeEntity.complaint_type,
          complain_typeEntity.description,
          id,
        ],
      );

     await this.dynamicConnection.query(
        'update complaint_type SET complaint_type =?, description = ? where hospital_complaint_type_id = ? and Hospital_id = ? ',
        [
          complain_typeEntity.complaint_type,
          complain_typeEntity.description,
          id,
          complain_typeEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.COMPLAINT_TYPE_UPDATED ,
            updated_values: await this.connection.query(
              'SELECT * FROM complaint_type WHERE id = ?',
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
      'SELECT id FROM complaint_type WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, message: process.env.EXISTING_RECORD  }];
    }
   
    try {
     await this.connection.query(
        'DELETE FROM complaint_type WHERE id = ?',
        [id],
      );

      const [complain_type] = await this.dynamicConnection.query(
        `select id from complaint_type where hospital_complaint_type_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from complaint_type where id = ? and Hospital_id = ?`,
        [complain_type.id, Hospital_id],
      );
       return [
      {
        status:  process.env.SUCCESS_STATUS_V2,
        message:  process.env.DELETED
      },
    ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async SetupFrontofficeComplainType(
    search: string,
  ): Promise<SetupFrontOfficeComplainType[]> {
    let query = ` SELECT * FROM complaint_type `;
    let values = [];
    if (search) {
      query += ` WHERE ( complaint_type.complaint_type LIKE ? OR complaint_type.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const SetupFrontOfficeComplainType = await this.connection.query(
      final,
      values,
    );
    return SetupFrontOfficeComplainType;
  }

  async find_complaintype(limit:number,pagenumber:number){
    try {
      
      if(!limit){
        limit = 10
      }

      if(!pagenumber){
        pagenumber = 1
      }

      const offset = limit * (pagenumber - 1);
      
      
      const complaint_type = await this.connection.query(
        'SELECT * FROM complaint_type LIMIT ? OFFSET ?',
        [Number(limit),Number(offset)]);
        
        let [total_list] = await this.connection.query(`SELECT count(id) as total from complaint_type`)

        return {
          status: process.env.SUCCESS_STATUS_V2,
          message:process.env.COMPLAINT_TYPE_FETCHED,
          data:process.env.COMPLAINT_TYPE_DATA,
          total:total_list.total
        };

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
