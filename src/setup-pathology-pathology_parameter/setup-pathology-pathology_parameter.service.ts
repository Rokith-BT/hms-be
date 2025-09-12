import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPathologyPathologyParameter } from "./entities/setup-pathology-pathology_parameter.entity";
import { CountDto } from "./dto/setup-pathology-pathology_parameter.dto";

@Injectable()
export class SetupPathologyPathologyParameterService {
  constructor(private readonly connection: DataSource,
      @InjectDataSource('AdminConnection')
      private readonly  dynamicConnection: DataSource,
  ){} 

  async create(pathology_parameterEntity: SetupPathologyPathologyParameter ): Promise<{ [key: string]: any }[]> {
    
    try{
    const result = await this.connection.query(
      'INSERT INTO pathology_parameter (parameter_name,test_value,reference_range,gender,unit,description) VALUES (?,?,?,?,?,?)',
      [pathology_parameterEntity.parameter_name,
        pathology_parameterEntity.test_value,
        pathology_parameterEntity.reference_range,
        pathology_parameterEntity.gender,
        pathology_parameterEntity.unit,
        pathology_parameterEntity.description
       
      ]
    );


   
   
const [patho_unit] = await this.dynamicConnection.query(`select id from unit where Hospital_id = ? and hospital_unit_id = ?`,
[pathology_parameterEntity.Hospital_id,
pathology_parameterEntity.unit]
)


    const AdminCategory = await this.dynamicConnection.query('Insert into pathology_parameter (parameter_name,test_value,reference_range,gender,unit,description,Hospital_id,hospital_pathology_parameter_id) VALUES (?,?,?,?,?,?,?,?)',[
      pathology_parameterEntity.parameter_name,
      pathology_parameterEntity.test_value,
      pathology_parameterEntity.reference_range,
      pathology_parameterEntity.gender,
      patho_unit.id,
            pathology_parameterEntity.description,
      pathology_parameterEntity.Hospital_id,
      result.insertId
    ])


    return  [{"data ":{"id  ":result.insertId,
              "status": process.env.SUCCESS_STATUS_V2,
              "messege":process.env.PATHOLOGY_PARAMETER,
              "inserted_data": await this.connection.query('SELECT * FROM pathology_parameter WHERE id = ?', [result.insertId])
              }}];
  }
  catch (error) {
   throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  
  async findAll(): Promise<SetupPathologyPathologyParameterService[]> {
    try{
    const unit = await this.connection.query(`select pathology_parameter.id,pathology_parameter.parameter_name,pathology_parameter.reference_range,unit.unit_name,pathology_parameter.description from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id`);
    return unit ;
     } catch (error) {
      throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  async findOne(id: string): Promise<SetupPathologyPathologyParameterService | null> {
    try{
    const unit = await this.connection.query(`select pathology_parameter.id,pathology_parameter.parameter_name,pathology_parameter.reference_range,unit.unit_name,pathology_parameter.description from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id WHERE pathology_parameter.id = ?`, [id]);
    
    if (unit.length === 1) {
      return unit ;
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


  async update(id: string, pathology_parameterEntity: SetupPathologyPathologyParameter): Promise<{ [key: string]: any }[]> {
    
    try {      
       await this.connection.query(
        'UPDATE pathology_parameter SET parameter_name =?,reference_range =?,unit =?,description =? WHERE id = ?',
        [ pathology_parameterEntity.parameter_name,
          pathology_parameterEntity.reference_range,
          pathology_parameterEntity.unit,
          pathology_parameterEntity.description,
         id
        ]
      );

   await this.dynamicConnection.query(
    'update pathology_parameter SET parameter_name = ?,reference_range =?,unit =? ,description =? Where hospital_pathology_parameter_id =? and Hospital_id = ?',
    [
      pathology_parameterEntity.parameter_name,
      pathology_parameterEntity.reference_range,
      pathology_parameterEntity.unit,
      pathology_parameterEntity.description,
      id,
      pathology_parameterEntity.Hospital_id
    ]
  )
 
      return  [{"data ":{
      status:process.env.SUCCESS_STATUS_V2,
      messege: process.env.PATHOLOGY_PARAMETER_UPDATED,
      "updated_values":await this.connection.query('SELECT * FROM pathology_parameter WHERE id = ?', [id])
      }}];
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string,Hospital_id:number): Promise<{ [key: string]: any }[]> {
    try{
     await this.connection.query('DELETE FROM pathology_parameter WHERE id = ?', [id]);
   

      const pathology_parameter = await this.dynamicConnection.query(`select id from pathology_parameter where hospital_pathology_parameter_id = ?`, [id]);
      const patho = pathology_parameter[0].id;
      console.log("patho",patho);
      
      await this.dynamicConnection.query(`delete from pathology_parameter where id = ? and Hospital_id = ?`, [patho,Hospital_id])
   


    return [{
      status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
    }
    ];
  }
     catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }



  async findPathologyParameterSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select pathology_parameter.id,pathology_parameter.parameter_name,pathology_parameter.reference_range,unit.unit_name,pathology_parameter.description from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id `;

    let countQuery = `
      SELECT COUNT(pathology_parameter.id) AS total from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id `;

    if (search) {

      const condition = `
      WHERE pathology_parameter.parameter_name LIKE ? OR pathology_parameter.reference_range LIKE ? OR unit.unit_name LIKE ? OR pathology_parameter.description LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY pathology_parameter.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const PathologyParameterSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyParameterSearch,
      total: countResult.total ?? 0,
    };
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }





  async findPathologyParametersSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select pathology_parameter.id,pathology_parameter.parameter_name,pathology_parameter.reference_range,unit.unit_name,pathology_parameter.description from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id `;

    let countQuery = `
      SELECT COUNT(pathology_parameter.id) AS total from pathology_parameter
    left join unit on pathology_parameter.unit = unit.id `;

    if (search) {

      const condition = `
      WHERE pathology_parameter.parameter_name LIKE ? OR pathology_parameter.reference_range LIKE ? OR unit.unit_name LIKE ? OR pathology_parameter.description LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY pathology_parameter.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const PathologyParameterSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: PathologyParameterSearch,
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