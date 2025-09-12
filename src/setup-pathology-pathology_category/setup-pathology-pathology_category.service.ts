import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPathologyPathologyCategory } from "./entities/setup-pathology-pathology_category.entity";
import {CountDto} from './dto/setup-pathology-pathology_category.dto';


@Injectable()
export class SetupPathologyPathologyCategoryService {
  constructor(private readonly connection: DataSource,
      @InjectDataSource('AdminConnection')
      private readonly  dynamicConnection: DataSource,
  ){} 
  async create(pathology_categoryEntity: SetupPathologyPathologyCategory ): Promise<{ [key: string]: any }[]> {

    const [existingpatho_cate] = await this.connection.query(`
      SELECT id FROM pathology_category WHERE category_name = ? LIMIT 1`,
      [pathology_categoryEntity.category_name ])

      if(existingpatho_cate){
        return [{
           status: process.env.DUPLICATE_NAME,
          message: process.env.EXISTING_RECORD,
        }]
      }



    try{
    const result = await this.connection.query(
      'INSERT INTO pathology_category (category_name) VALUES (?)',
      [pathology_categoryEntity.category_name       
      ]
    );
   await this.dynamicConnection.query(`INSERT INTO pathology_category (category_name,Hospital_id,hospital_pathology_category_id) VALUES (?,?,?)`,[
      pathology_categoryEntity.category_name,
      pathology_categoryEntity.Hospital_id,
      result.insertId
    ]) 
    return  [{"data ":{"id  ":result.insertId,
              "status": process.env.SUCCESS_STATUS_V2,
              "messege": process.env.PATHOLOGY_CATEGORY,
              "inserted_data": await this.connection.query('SELECT * FROM pathology_category WHERE id = ?', [result.insertId])
              }}];
  } catch(error){
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupPathologyPathologyCategory[]> {
    try {
      const pathology_category = await this.connection.query('SELECT * FROM pathology_category');
    return pathology_category ;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }

  async findOne(id: string): Promise<SetupPathologyPathologyCategory | null> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM pathology_category WHERE id = ?`,[id])

      if(!existingRecord || existingRecord.length === 0) {
        throw new HttpException(
          {
          status: process.env.IDENTITY,
          message:  process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
        )
      }

    try {
       const pathology_category = await this.connection.query('SELECT * FROM pathology_category WHERE id = ?', [id]);
    
    if (pathology_category.length === 1) {
      return pathology_category ;
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

  async update(id: string, pathology_categoryEntity: SetupPathologyPathologyCategory): Promise<{ [key: string]: any }[]> {

 const [existingRecord] = await this.connection.query(`
      SELECT id FROM pathology_category WHERE id = ?`,[id])

      if(!existingRecord || existingRecord.length === 0) {
        throw new HttpException(
          {
          status: process.env.IDENTITY,
          message:  process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
        )
      }


    try {
       await this.connection.query(
        'UPDATE pathology_category SET category_name =? WHERE id = ?',
        [pathology_categoryEntity.category_name, 
        
         id
        ]
      );

      


   await this.dynamicConnection.query(
    'update pathology_category SET category_name = ? where hospital_pathology_category_id =? and Hospital_id= ?',
    [pathology_categoryEntity.category_name,
      id,
      pathology_categoryEntity.Hospital_id
    ]
  )
  
      return  [{"data ":{
      status:process.env.SUCCESS_STATUS_V2,
      "message": process.env.PATHOLOGY_CATEGORY_UPDATED,
      "updated_values":await this.connection.query('SELECT * FROM pathology_category WHERE id = ?', [id])
      }}];
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async remove(id: string,Hospital_id:number): Promise<{ [key: string]: any }[]> {
    
     const [existingRecord] = await this.connection.query(`
      SELECT id FROM pathology_category WHERE id = ?`,[id])

      if(!existingRecord || existingRecord.length === 0) {
        throw new HttpException(
          {
          status: process.env.IDENTITY,
          message:  process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
        )
      }


   try{
    await this.connection.query('DELETE FROM pathology_category WHERE id = ?', [id]);

const [admin] = await this.dynamicConnection.query(`select id from pathology_category where hospital_pathology_category_id = ?`,[id])

await this.dynamicConnection.query(`delete from pathology_category where id = ? and Hospital_id = ?`,[
  admin.id,
  Hospital_id
])

return [{
           status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
}
];

   } catch(error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
          }

   
  }


  async findPathologyCategorySearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM pathology_category `;

    let countQuery = `
      SELECT COUNT(pathology_category.id) AS total FROM pathology_category `;

    if (search) {

      const condition = `
      WHERE pathology_category.category_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY pathology_category.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const PathologyCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyCategorySearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
        
    }
  }



  async findPathologyCategorysSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM pathology_category `;

    let countQuery = `
      SELECT COUNT(pathology_category.id) AS total FROM pathology_category `;

    if (search) {

      const condition = `
      WHERE pathology_category.category_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY pathology_category.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const PathologyCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyCategorySearch,
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