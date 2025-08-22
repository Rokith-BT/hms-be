import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SetupSymptomsSymptomsHead } from './entities/setup-symptoms-symptoms_head.entity';
import {CountDto} from './dto/setup-symptoms-symptoms_head.dto';

@Injectable()
export class SetupSymptomsSymptomsHeadService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async create(symptoms_headEntity: SetupSymptomsSymptomsHead) {
    try {
      const result = await this.connection.query(
        'INSERT INTO symptoms (symptoms_title,description,type) VALUES (?,?,?)',
        [
          symptoms_headEntity.symptoms_title,
          symptoms_headEntity.description,
          symptoms_headEntity.type,
        ],
      );
      await this.dynamicConnection.query(
        `INSERT INTO symptoms (symptoms_title,description,type,Hospital_id,hospital_symptoms_id) VALUES (?,?,?,?,?)`,
        [
          symptoms_headEntity.symptoms_title,
          symptoms_headEntity.description,
          symptoms_headEntity.type,
          symptoms_headEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SYMPTOMS,
            inserted_data: await this.connection.query(
              'SELECT * FROM symptoms WHERE id = ?',
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

  async findAll(): Promise<SetupSymptomsSymptomsHead[]> {
    try {
        const symptoms = await this.connection
      .query(`select symptoms.id,symptoms.symptoms_title as symptoms_head,symptoms.description,symptoms_classification.id as symptoms_type_id,symptoms_classification.symptoms_type from symptoms
    left join symptoms_classification on symptoms.type = symptoms_classification.id`);
    return symptoms;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR); 
    }
  
  }

  async findOne(id: string): Promise<SetupSymptomsSymptomsHead | null> {
    try {
       const symptoms = await this.connection.query(
      `select symptoms.id,symptoms.symptoms_title as symptoms_head,symptoms.description,symptoms_classification.symptoms_type from symptoms
    left join symptoms_classification on symptoms.type = symptoms_classification.id WHERE id = ?`,
      [id],
    );

    if (symptoms.length === 1) {
      return symptoms;
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
    symptoms_headEntity: SetupSymptomsSymptomsHead,
  ): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'UPDATE symptoms SET symptoms_title =? , description =?, type =? WHERE id = ?',
        [
          symptoms_headEntity.symptoms_title,
          symptoms_headEntity.description,
          symptoms_headEntity.type,
          id,
        ],
      );

      await this.dynamicConnection.query(
        'update symptoms SET symptoms_title = ?,description =?, type =?  where hospital_symptoms_id = ? and Hospital_id= ?',

        [
          symptoms_headEntity.symptoms_title,
          symptoms_headEntity.description,
          symptoms_headEntity.type,
          id,
          symptoms_headEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.SYMPTOMS_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM symptoms WHERE id = ?',
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
      await this.connection.query('DELETE FROM symptoms WHERE id = ?', [id]);

    const symptoms_head = await this.dynamicConnection.query(
      `select id from symptoms where hospital_symptoms_id = ?`,
      [id],
    );
    const symptoms = symptoms_head[0].id;

    await this.dynamicConnection.query(
      `delete from symptoms where id = ? and Hospital_id = ?`,
      [symptoms, Hospital_id],
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
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  async setupSymptomsHead(
    search: string,
  ): Promise<SetupSymptomsSymptomsHead[]> {
    try {
       let query = ` select symptoms.id,symptoms.symptoms_title as symptoms_head,symptoms.description,symptoms_classification.id as symptoms_type_id,symptoms_classification.symptoms_type from symptoms
    left join symptoms_classification on symptoms.type = symptoms_classification.id `;

    let values = [];

    if (search) {
      query += ` WHERE ( symptoms.symptoms_title LIKE ? OR symptoms_classification.symptoms_type LIKE ? OR symptoms.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;

    const SetupSymptomshead = await this.connection.query(final, values);

    return SetupSymptomshead;
    
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

 

  async findAllSymptomsHead(
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);

    const Symptoms_Head = await this.connection.query(
            `select symptoms.id,symptoms.symptoms_title as symptoms_head,symptoms.description,symptoms_classification.id as symptoms_type_id,symptoms_classification.symptoms_type from symptoms
       left join symptoms_classification on symptoms.type = symptoms_classification.id LIMIT ? OFFSET ? `,
            [Number(limit), Number(offset)],
          );

    try {
      
      let [total_list] = await this.connection.query(
              `SELECT count(id) as total FROM symptoms`,
            );
 
      let out = {
        details: Symptoms_Head,
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


  async findSymptomsHeadSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select symptoms.id,symptoms.symptoms_title as symptoms_head,symptoms.description,symptoms_classification.id as symptoms_type_id,symptoms_classification.symptoms_type from symptoms
    left join symptoms_classification on symptoms.type = symptoms_classification.id `;

    let countQuery = `
      SELECT COUNT(symptoms.id) AS total 
      FROM symptoms left join symptoms_classification on symptoms.type = symptoms_classification.id `;

    if (search) {

      const condition = `
      WHERE symptoms.symptoms_title LIKE ? OR symptoms_classification.symptoms_type LIKE ? OR symptoms.description LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY symptoms.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const SymptomsHeadSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: SymptomsHeadSearch,
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
