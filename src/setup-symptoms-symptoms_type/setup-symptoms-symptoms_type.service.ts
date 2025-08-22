import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupSymptomsSymptomsType } from './entities/setup-symptoms-symptoms_type.entity';
import {CountDto} from './dto/setup-symptoms-symptoms_type.dto';

@Injectable()
export class SetupSymptomsSymptomsTypeService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}

  async create(symptoms_typeEntity: SetupSymptomsSymptomsType) {
    try {
      const result = await this.connection.query(
        'INSERT INTO symptoms_classification (symptoms_type) VALUES (?)',
        [symptoms_typeEntity.symptoms_type],
      );
      await this.dynamicConnection.query(
        `insert into symptoms_classification (symptoms_type,Hospital_id,hospital_symptoms_classification_id) values (?,?,?)`,
        [
          symptoms_typeEntity.symptoms_type,
          symptoms_typeEntity.Hospital_id,
          result.insertId,
        ],
      );
      return [
        {
          'data ': {
            'id  ': result.insertId,
            status:process.env.SUCCESS_STATUS_V2,
            message: process.env.SYMPTOMS_CLASSIFICATION,
            inserted_data: await this.connection.query(
              'SELECT * FROM symptoms_classification WHERE id = ?',
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


  async findAll(): Promise<SetupSymptomsSymptomsType[]> {
    try {
      const symptoms_classification = await this.connection.query(
      'SELECT * FROM symptoms_classification',
    );
    return symptoms_classification;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }
  async findOne(id: string): Promise<SetupSymptomsSymptomsType | null> {

    try {
       const symptoms_classification = await this.connection.query(
      'SELECT * FROM symptoms_classification WHERE id = ?',
      [id],
    );

    if (symptoms_classification.length === 1) {
      return symptoms_classification;
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
    symptoms_typeEntity: SetupSymptomsSymptomsType,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'UPDATE symptoms_classification SET symptoms_type =? WHERE id = ?',
        [symptoms_typeEntity.symptoms_type, id],
      );
      await this.dynamicConnection.query(
        'update symptoms_classification SET symptoms_type = ? where hospital_symptoms_classification_id = ? and Hospital_id= ?',

        [
          symptoms_typeEntity.symptoms_type,
          id,
          symptoms_typeEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SYMPTOMS_CLASSIFICATION_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM symptoms_classification WHERE id = ?',
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
        'DELETE FROM symptoms_classification WHERE id = ?',
        [id],
      );

      const [admin] = await this.dynamicConnection.query(
        `select id from symptoms_classification where hospital_symptoms_classification_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from symptoms_classification where id = ? and Hospital_id = ?`,
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

  async setupSymptomsType(
    search: string,
  ): Promise<SetupSymptomsSymptomsType[]> {
    try {
       let query = ` SELECT * FROM symptoms_classification `;
    let values = [];
    if (search) {
      query += ` WHERE ( symptoms_classification.symptoms_type LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupsymptomsType = await this.connection.query(final, values);
    return setupsymptomsType;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }


  async findAllSymptomsType(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Symptoms_Type = await this.connection.query(
            `SELECT * FROM symptoms_classification LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM symptoms_classification`,
            );
 
      let out = {
        details: Symptoms_Type,
        total: total_list.total,
      };
      return out;
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findSymptomsTypeSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM symptoms_classification `;

    let countQuery = `
      SELECT COUNT(symptoms_classification.id) AS total 
      FROM symptoms_classification `;

    if (search) {

      const condition = `
      WHERE symptoms_classification.symptoms_type LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY symptoms_classification.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const SymptomsTypeSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: SymptomsTypeSearch,
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
