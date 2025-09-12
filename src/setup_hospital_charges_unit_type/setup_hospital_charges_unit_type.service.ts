import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHospitalChargesUnitType } from "./entities/setup_hospital_charges_unit_type.entity";

@Injectable()
export class unit_typeService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    unit_typeEntity: SetupHospitalChargesUnitType,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const [existingUnitType] = await this.connection.query(
        `SELECT id FROM charge_units WHERE unit = ? LIMIT 1`, [unit_typeEntity.unit]
      );

      if (existingUnitType) {
        return [
          {
            status: process.env.DUPLICATE_NAME,
            message: process.env.EXISTING_RECORD,
          },
        ];
      }
      const result = await this.connection.query(
        'INSERT INTO charge_units (unit) VALUES (?)',
        [unit_typeEntity.unit],
      );

      await this.dynamicConnection.query(
        'INSERT INTO charge_units (unit,Hospital_id,hospital_charge_units_id) VALUES (?,?,?)',
        [unit_typeEntity.unit, unit_typeEntity.Hospital_id, result.insertId],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            "status": process.env.SUCCESS_STATUS_V2,
            "messege": process.env.CHARGE_UNIT,
            inserted_data: await this.connection.query(
              'SELECT * FROM charge_units WHERE id = ?',
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

  async findAll(): Promise<SetupHospitalChargesUnitType[]> {
    try {
      const unit_type = await this.connection.query(
        'select charge_units.id as charge_unit_id,charge_units.unit,charge_units.is_active from charge_units',
      );
      return unit_type;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id: string) {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_units WHERE id = ?', [id]
    );

    if (!existingRecord) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const unit_type = await this.connection.query(
        'SELECT * FROM charge_units WHERE id = ?',
        [id],
      );

      return unit_type;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async update(
    id: string,
    unit_typeEntity: SetupHospitalChargesUnitType,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(`SELECT id FROM charge_units WHERE id = ?`, [id]);
    if (!existingRecord) {
      return [{ status: process.env.ERROR, 
         message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'UPDATE charge_units SET unit =? WHERE id = ?',
        [unit_typeEntity.unit, id],
      );

      await this.dynamicConnection.query(
        'update charge_units SET unit = ? where hospital_charge_units_id = ? and Hospital_id = ?',
        [unit_typeEntity.unit, id, unit_typeEntity.Hospital_id],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_UNIT_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM charge_units WHERE id = ?',
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
      'SELECT id FROM charge_units WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }


    try {
      const unit_type = await this.dynamicConnection.query(
        `select id from charge_units where hospital_charge_units_id = ? and Hospital_id = ?`,
        [id, Hospital_id],
      );
      const unittypes = unit_type[0].id;
      const getChargeUnitIdInCharges = await this.connection.query(
        `select id from charges where charge_unit_id = ?`,
        [id],
      );

      if (getChargeUnitIdInCharges.length <= 0) {
        await this.connection.query(
          'DELETE FROM charge_units WHERE id = ?',
          [id],
        );
        await this.dynamicConnection.query(
          `delete from charge_units where id = ? `,
          [unittypes],
        );
        return [
          {
            status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
          },
        ];
      } else {
        return [
          {
            status: process.env.ERROR_STATUS,
            message:
              'charge_units id : ' +
              id +
              ' is used in charges so it cant be deleted',
          },
        ];
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setupHosChargesUnitType(
    search: string,
  ): Promise<SetupHospitalChargesUnitType[]> {
    let query = ` SELECT * FROM charge_units `;
    let values = [];

    if (search) {
      query += ` WHERE ( charge_units.unit LIKE ? )  `;
      values.push('%' + search + '%');
    }

    let final = query;

    const setupHospitalChargesUnitTypeSearch = await this.connection.query(
      final,
      values,
    );

    return setupHospitalChargesUnitTypeSearch;
  }

  async findALLunit_type(limit:number, page:number, search:string) {

    try {
      const offset = limit * (page-1);
      let dateCondition = '';
      let searchClause = '';

      if(search) {
        const searchClause = `(
        charge_units.unit  LIKE '%${search}%')`;

        dateCondition = ` AND ${searchClause}`;

      }

      const unit_type = await this.connection.query(`select charge_units.id as charge_unit_id,charge_units.unit,charge_units.is_active from charge_units where charge_units.id ${dateCondition} LIMIT ? OFFSET ?`,
        [Number(limit),Number(offset)]
      );

      let [totallist] = await this.connection.query(`select count(id) as total FROM charge_units where charge_units.id ${dateCondition}`);

      let variable = {
        details: unit_type,
        total: totallist.total,
        page: page,
        limit: limit
      }

      return variable;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
