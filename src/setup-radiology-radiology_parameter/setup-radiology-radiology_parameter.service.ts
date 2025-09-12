import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupRadiologyRadiologyParameter } from "./entities/setup-radiology-radiology_parameter.entity";
import { CountDto } from "./dto/setup-radiology-radiology_parameter.dto";

@Injectable()
export class SetupRadiologyRadiologyParameterService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(radiology_parameterEntity: SetupRadiologyRadiologyParameter): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO radiology_parameter (parameter_name,test_value,reference_range,gender,unit,description) VALUES (?,?,?,?,?,?)',
        [radiology_parameterEntity.parameter_name,
        radiology_parameterEntity.test_value,
        radiology_parameterEntity.reference_range,
        radiology_parameterEntity.gender,
        radiology_parameterEntity.unit,
        radiology_parameterEntity.description
        ]
      );
      await this.dynamicConnection.query(`INSERT INTO radiology_parameter
     (parameter_name,test_value,reference_range,gender,unit,description,Hospital_id,hospital_radiology_parameter_id) VALUES (?,?,?,?,?,?,?,?)`, [
        radiology_parameterEntity.parameter_name,
        radiology_parameterEntity.test_value,
        radiology_parameterEntity.reference_range,
        radiology_parameterEntity.gender,
        radiology_parameterEntity.unit,
        radiology_parameterEntity.description,
        radiology_parameterEntity.Hospital_id,

        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.RADIOLOGY,
          "inserted_data": await this.connection.query('SELECT * FROM radiology_parameter WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupRadiologyRadiologyParameter[]> {
    try {
      const radiology_parameter = await this.connection.query(`select radiology_parameter.id,radiology_parameter.parameter_name,radiology_parameter.reference_range,unit.unit_name,radiology_parameter.description from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id ;`);
    return radiology_parameter;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }

  async findOne(id: string): Promise<SetupRadiologyRadiologyParameter | null> {
    try {
        const radiology_parameter = await this.connection.query(`select radiology_parameter.id,radiology_parameter.parameter_name,radiology_parameter.reference_range,unit.unit_name,radiology_parameter.description from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id WHERE radiology_parameter.id = ? `, [id]);

    if (radiology_parameter.length === 1) {
      return radiology_parameter;
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


  async update(id: string, radiology_parameterEntity: SetupRadiologyRadiologyParameter): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query(
        'UPDATE radiology_parameter SET parameter_name =?,reference_range =?,unit =?,description =? WHERE id = ?',
        [radiology_parameterEntity.parameter_name,
        radiology_parameterEntity.reference_range,
        radiology_parameterEntity.unit,
        radiology_parameterEntity.description,
          id
        ]
      );

      await this.dynamicConnection.query(
        'update radiology_parameter SET parameter_name = ?,reference_range = ?,unit = ?,description = ? where hospital_radiology_parameter_id = ? and Hospital_id= ?',
        [radiology_parameterEntity.parameter_name,
        radiology_parameterEntity.reference_range,
        radiology_parameterEntity.unit,
        radiology_parameterEntity.description,
          id,
        radiology_parameterEntity.Hospital_id
        ]
      );

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          messege: process.env.RADIOLOGY_PARAMETER,
          "updated_values": await this.connection.query('SELECT * FROM radiology_parameter WHERE id = ?', [id])
        }
      }];
    } catch (error) {
        const radiology_parameter = await this.connection.query(`select radiology_parameter.id,radiology_parameter.parameter_name,radiology_parameter.reference_range,unit.unit_name,radiology_parameter.description from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id WHERE radiology_parameter.id = ? `, [id]);

    if (radiology_parameter.length === 1) {
      return radiology_parameter;
    } else {
      return null;
    }
    }
  }

  async remove(id: string, Hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM radiology_parameter WHERE id = ?', [id]);

      const [admin] = await this.dynamicConnection.query(`select id from radiology_parameter where hospital_radiology_parameter_id = ? `, [id])

      await this.dynamicConnection.query(`delete from radiology_parameter where id = ? and Hospital_id = ?`, [admin.id, Hospital_id])

    } catch (error) {
 throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);    }
    return [{
     status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
    }
    ];
  }


  async findRadiologyParameterSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select radiology_parameter.id,radiology_parameter.parameter_name,radiology_parameter.reference_range,unit.unit_name,radiology_parameter.description from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id `;

    let countQuery = `
      SELECT COUNT(radiology_parameter.id) AS total from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id `;

    if (search) {

      const condition = `
      WHERE radiology_parameter.parameter_name LIKE ? OR radiology_parameter.reference_range LIKE ? OR unit.unit_name LIKE ? OR radiology_parameter.description LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY radiology_parameter.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyParameterSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyParameterSearch,
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


  async findRadiologyParametersSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      select radiology_parameter.id,radiology_parameter.parameter_name,radiology_parameter.reference_range,unit.unit_name,radiology_parameter.description from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id `;

    let countQuery = `
      SELECT COUNT(radiology_parameter.id) AS total from radiology_parameter
    left join unit on radiology_parameter.unit = unit.id `;

    if (search) {

      const condition = `
      WHERE radiology_parameter.parameter_name LIKE ? OR radiology_parameter.reference_range LIKE ? OR unit.unit_name LIKE ? OR radiology_parameter.description LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY radiology_parameter.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const RadiologyParameterSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: RadiologyParameterSearch,
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
