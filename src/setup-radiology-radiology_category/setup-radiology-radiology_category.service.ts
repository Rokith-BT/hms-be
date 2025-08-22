import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupRadiologyRadiologyCategory } from "./entities/setup-radiology-radiology_category.entity";
import { CountDto } from "./dto/setup-radiology-radiology_category.dto";
import { HttpException, HttpStatus } from "@nestjs/common";

export class SetupRadiologyRadiologyCategoryService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(radiology_categoryEntity: SetupRadiologyRadiologyCategory): Promise<{ [key: string]: any }[]> {
    try {
      const result = await this.connection.query(
        'INSERT INTO lab (lab_name) VALUES (?)',
        [radiology_categoryEntity.lab_name
        ]
      );
      await this.dynamicConnection.query(`INSERT INTO lab (lab_name,Hospital_id,hospital_lab_id) VALUES (?,?,?)`, [
        radiology_categoryEntity.lab_name,
        radiology_categoryEntity.Hospital_id,
        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.LAB,
          "inserted_data": await this.connection.query('SELECT * FROM lab WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }


  async findAll(): Promise<SetupRadiologyRadiologyCategory[]> {
    try {
       const lab = await this.connection.query('SELECT * FROM lab');
    return lab;
    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }


  async findOne(id: string): Promise<SetupRadiologyRadiologyCategory | null> {
    try {
        const lab = await this.connection.query('SELECT * FROM lab WHERE id = ?', [id]);
    if (lab.length === 1) {
      return lab;
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
  async update(id: string, radiology_categoryEntity: SetupRadiologyRadiologyCategory): Promise<{ [key: string]: any }[]> {
       try {

     await this.connection.query(
        'UPDATE lab SET lab_name =? WHERE id = ?',
        [radiology_categoryEntity.lab_name,
          id
        ]
      );
     await this.dynamicConnection.query(
        'update lab SET lab_name = ? where hospital_lab_id = ? and Hospital_id= ?',

        [radiology_categoryEntity.lab_name,
          id,
        radiology_categoryEntity.Hospital_id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.LAB_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM lab WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
       await this.connection.query('DELETE FROM lab WHERE id = ?', [id]);
      const [admin] = await this.dynamicConnection.query(`select id from lab where hospital_lab_id = ? `, [id])
      await this.dynamicConnection.query(`delete from lab where id = ? and Hospital_id = ? `, [
        admin.id,
        Hospital_id
      ])
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
    return [{
      status: process.env.SUCCESS_STATUS_V2,
      message :process.env.ERROR_MESSAGE,
    }
    ];
  }


  async findRadiologyCategorySearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM lab `;

    let countQuery = `
      SELECT COUNT(lab.id) AS total FROM lab `;

    if (search) {

      const condition = `
      WHERE lab.lab_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY lab.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyCategorySearch,
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


  async findRadiologyCategorysSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM lab `;

    let countQuery = `
      SELECT COUNT(lab.id) AS total FROM lab `;

    if (search) {

      const condition = `
      WHERE lab.lab_name LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY lab.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyCategorySearch,
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
