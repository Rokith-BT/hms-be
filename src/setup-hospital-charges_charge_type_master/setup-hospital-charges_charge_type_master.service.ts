import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHospitalChargesChargeTypeMaster } from "./entities/setup-hospital-charges_charge_type_master.entity";

@Injectable()
export class SetupHospitalChargesChargeTypeMasterService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    charge_type_masterEntity: SetupHospitalChargesChargeTypeMaster,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO charge_type_master (charge_type,is_default,is_active) VALUES (?,?,?)',
        [
          charge_type_masterEntity.charge_type,
          charge_type_masterEntity.is_default,
          charge_type_masterEntity.is_active,
        ],
      );

      await this.dynamicConnection.query(
        `INSERT INTO charge_type_master (charge_type,is_default,is_active,
      Hospital_id,hospital_charge_type_master_id) VALUES (?,?,?,?,?)`,
        [
          charge_type_masterEntity.charge_type,
          charge_type_masterEntity.is_default,
          charge_type_masterEntity.is_active,
          charge_type_masterEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          data: {
            id: result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_TYPE_MASTER,
            inserted_data: await this.connection.query(
              'SELECT * FROM charge_type_master WHERE id = ?',
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
  async findAll(): Promise<SetupHospitalChargesChargeTypeMaster[]> {
    try {
      const charge_type_master = await this.connection.query(
        'SELECT * FROM charge_type_master',
      );
      return charge_type_master;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id: string): Promise<SetupHospitalChargesChargeTypeMaster> {

    const [existingRecord] = await this.connection.query(
      'SELECT * FROM charge_type_master WHERE id = ?', [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException({
        status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
      }, HttpStatus.NOT_FOUND);
    }
    try {
      const charge_type_master = await this.connection.query(
        'SELECT * FROM charge_type_master WHERE id = ?',
        [id],
      );

      return charge_type_master;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  }

  async update(
    id: string,
    charge_type_masterEntity: SetupHospitalChargesChargeTypeMaster,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_type_master WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{  status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD  }];
    }

    try {
      await this.connection.query(
        'UPDATE charge_type_master SET charge_type =?,  is_default =?,  is_active =? WHERE id = ?',
        [
          charge_type_masterEntity.charge_type,
          charge_type_masterEntity.is_default,
          charge_type_masterEntity.is_active,
          id,
        ],
      );

      await this.dynamicConnection.query(
        'update charge_type_master SET charge_type = ?, is_default = ?, is_active= ? where hospital_charge_type_master_id = ? and Hospital_id = ? ',
        [
          charge_type_masterEntity.charge_type,
          charge_type_masterEntity.is_default,
          charge_type_masterEntity.is_active,
          id,
          charge_type_masterEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_TYPE_MASTER_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM charge_type_master WHERE id = ?',
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
      'SELECT id FROM charge_type_master WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'DELETE FROM charge_type_master WHERE id = ?',
        [id],
      );

      const charge_type = await this.dynamicConnection.query(
        `select id from charge_type_master where hospital_charge_type_master_id = ?`,
        [id],
      );
      const type = charge_type[0].id;
      await this.dynamicConnection.query(
        `delete from charge_type_master where id = ? and Hospital_id = ?`,
        [type, Hospital_id],
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

  async HospitalChargesChargeType(
    search: string,
  ): Promise<SetupHospitalChargesChargeTypeMaster[]> {
    let query = ` SELECT * FROM charge_type_master `;
    let values = [];

    if (search) {
      query += ` WHERE ( charge_type_master.charge_type LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupHospitalChargesChargeTypeSearch = await this.connection.query(
      final,
      values,
    );
    return setupHospitalChargesChargeTypeSearch;
  }

  async findALL_charge_type_master(limit:number,page:number, search:string) {
    try {
      
      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';

      if(search) {
        const searchClause = `(
        charge_type_master.charge_type LIKE '%${search}%' 
        )`;
        dateCondition = ` AND ${searchClause}`;
      }


      const charge_type_master = await this.connection.query(
        `SELECT * FROM charge_type_master WHERE charge_type_master.id ${dateCondition} LIMIT ? OFFSET ?`,
        [Number(limit),Number(offset)]
      ); 

      let [total_list] = await this.connection.query(`select count(id) as total from charge_type_master WHERE charge_type_master.id ${dateCondition}`);

      let variables = {
        details: charge_type_master,
        total: total_list.total,
        page:page,
        limit:limit
      }

      return variables;
      
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
