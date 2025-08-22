import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPharmacyMedicineDosage } from "./entities/setup_pharmacy_medicine_dosage.entity";


@Injectable()
export class SetupPharmacyMedicineDosageService {
  constructor(
    private readonly connection: DataSource,
        @InjectDataSource('AdminConnection')
        private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    Medicine_dosageEntity: SetupPharmacyMedicineDosage,
  ): Promise<{ [key: string]: any }[]> {
    
    try {
      const result = await this.connection.query(
        'INSERT INTO medicine_dosage (medicine_category_id,dosage,charge_units_id) VALUES (?,?,?)',
        [
          Medicine_dosageEntity.medicine_category_id,
          Medicine_dosageEntity.dosage,
          Medicine_dosageEntity.charge_units_id,
        ],
      );

      const [medicine_category] = await this.dynamicConnection.query(
        `select id from medicine_category where Hospital_id = ? and hospital_medicine_category_id = ?`,
        [
          Medicine_dosageEntity.Hospital_id,
          Medicine_dosageEntity.medicine_category_id,
        ],
      );

      const [charge_units] = await this.dynamicConnection.query(
        `select id from charge_units where Hospital_id = ? and hospital_charge_units_id = ?`,
        [
          Medicine_dosageEntity.Hospital_id,
          Medicine_dosageEntity.charge_units_id,
        ],
      );
      try {
         await this.dynamicConnection.query(
          'INSERT INTO medicine_dosage (medicine_category_id,dosage,charge_units_id,Hospital_id,hospital_medicine_dosage_id) values(?,?,?,?,?)',
          [
            medicine_category.id,
            Medicine_dosageEntity.dosage,
            charge_units.id,
            Medicine_dosageEntity.Hospital_id,
            result.insertId,
          ],
        );

        return [
          {
            'data ': {
              'id  ': result.insertId,
              status: 'success',
              messege: 'medicine_dosage details added successfully ',
              inserted_data: await this.connection.query(
                'SELECT * FROM medicine_dosage WHERE id = ?',
                [result.insertId],
              ),
            },
          },
        ];
      } catch (error) {
        return error;
      }
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findAll(): Promise<SetupPharmacyMedicineDosage[]> {
    try {
      
      const medicine_dosage = await this.connection.query(
        `select medicine_dosage.id, medicine_dosage.dosage,charge_units.unit, 
        medicine_category.medicine_category from medicine_dosage 
         join charge_units on charge_units.id = medicine_dosage.charge_units_id 
          join medicine_category on medicine_category.id = medicine_dosage.medicine_category_id`,
      );
      return medicine_dosage;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }
  
  }

  async findOne(id: string): Promise<SetupPharmacyMedicineDosage | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_dosage WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: 'identity',
          message: `ID ${id} does not exist or has already been deleted`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      
      const medicine_dosage = await this.connection.query(
        'SELECT * FROM medicine_dosage WHERE id = ?',
        [id],
      );
  
        return medicine_dosage;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
   
  }

  async update(
    id: string,
    Medicine_dosageEntity: SetupPharmacyMedicineDosage,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_dosage WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
    }
    
    try {
      await this.connection.query(
        'UPDATE medicine_dosage SET medicine_category_id = ?, dosage = ?,charge_units_id = ? WHERE id = ?',
        [
          Medicine_dosageEntity.medicine_category_id,
          Medicine_dosageEntity.dosage,
          Medicine_dosageEntity.charge_units_id,
          id,
        ],
      );

      const [medicine_category_id] = await this.dynamicConnection.query(
        `select id from medicine_category where hospital_medicine_category_id = ? and Hospital_id = ?`,
        [
          Medicine_dosageEntity.medicine_category_id,
          Medicine_dosageEntity.Hospital_id,
        ],
      );

      const [charge_units_id] = await this.dynamicConnection.query(
        `select id from charge_units where hospital_charge_units_id = ? and Hospital_id = ?`,
        [
          Medicine_dosageEntity.charge_units_id,
          Medicine_dosageEntity.Hospital_id,
        ],
      );

       await this.dynamicConnection.query(
        'update medicine_dosage SET medicine_category_id =?,dosage =?,charge_units_id =? where hospital_medicine_dosage_id = ? and Hospital_id =? ',
        [
          medicine_category_id.id,
          Medicine_dosageEntity.dosage,
          charge_units_id.id,
          id,
          Medicine_dosageEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: 'success',
            messege: 'medicine_dosage details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM medicine_dosage WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_dosage WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
    }
   
    try {
      await this.connection.query(
        'DELETE FROM medicine_dosage WHERE id = ?',
        [id],
      );

      const [medicine_dosage] = await this.dynamicConnection.query(
        `select id from medicine_dosage where hospital_medicine_dosage_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from medicine_dosage where id = ? and Hospital_id = ?`,
        [medicine_dosage.id, Hospital_id],
      );
      return [
        {
          status: 'success',
          message: ' id: ' + id + ' deleted successfully',
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
   
  }

  async setupPharmacyMedicineDosage(
    search: string,
  ): Promise<SetupPharmacyMedicineDosage[]> {
    let query = ` select medicine_dosage.id, medicine_dosage.dosage,charge_units.unit, medicine_category.medicine_category from medicine_dosage  join charge_units on charge_units.id = medicine_dosage.charge_units_id  join medicine_category on medicine_category.id = medicine_dosage.medicine_category_id `;
    let values = [];
    if (search) {
      query += ` WHERE ( medicine_category.medicine_category LIKE ? OR medicine_dosage.dosage LIKE ? ) `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupPharmacyMedicineDosageSearch = await this.connection.query(
      final,
      values,
    );
    return setupPharmacyMedicineDosageSearch;
  }

  async findmedicine_dosage(limit:number,page:number) {
    try {
      
      const offset = limit * (page - 1);

      const medicine_dosage = await this.connection.query(`select medicine_dosage.id, medicine_dosage.dosage,charge_units.unit, 
        medicine_category.medicine_category from medicine_dosage 
         join charge_units on charge_units.id = medicine_dosage.charge_units_id 
          join medicine_category on medicine_category.id = medicine_dosage.medicine_category_id LIMIT ? OFFSET ?`,[
            Number(limit),Number(offset)
          ])

          let [totallist] = await this.connection.query(`select count(id) as total from medicine_dosage`);

          let variables = {
            details: medicine_dosage,
            total: totallist.total,
            page:page,
            limit:limit
          }

          return variables;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
