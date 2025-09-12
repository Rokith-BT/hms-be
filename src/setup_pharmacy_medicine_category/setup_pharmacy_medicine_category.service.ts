import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPharmacyMedicineCategory } from "./entities/setup_pharmacy_medicine_category.entity";

@Injectable()
export class MedicineCategoryService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    MedicineCategoryEntity: SetupPharmacyMedicineCategory,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO medicine_category (medicine_category) VALUES (?)',
        [MedicineCategoryEntity.medicine_category],
      );

      await this.dynamicConnection.query(
        `INSERT INTO medicine_category (medicine_category,Hospital_id,hospital_medicine_category_id) values (?,?,?)`,
        [
          MedicineCategoryEntity.medicine_category,
          MedicineCategoryEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: 'success',
            messege: 'medicine_category details added successfully inserted',
            inserted_data: await this.connection.query(
              'SELECT * FROM medicine_category WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupPharmacyMedicineCategory[]> {
    try {
      const medicine_category = await this.connection.query(
        'SELECT * FROM medicine_category',
      );
      return medicine_category as SetupPharmacyMedicineCategory[];

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findOne(id: string): Promise<SetupPharmacyMedicineCategory | null> {

    const [existingRecord] = await this.dynamicConnection.query(`
      SELECT * FROM medicine_category WHERE id = ?`, [id]);

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException({
        status: 'identity',
        message: `ID ${id} does not exist or has already been deleted`,
      },
        HttpStatus.NOT_FOUND,
      );
    }

    try {

      const medicine_category = await this.connection.query(
        'SELECT * FROM medicine_category WHERE id = ?',
        [id],
      );

      return medicine_category;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVICE IS TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }



  }

  async update(
    id: string,
    MedicineCategoryEntity: SetupPharmacyMedicineCategory,
  ): Promise<{ [key: string]: any }[]> {


    const [existingRecord] = await this.connection.query(
      'SELECT id FROM medicine_category WHERE id = ?', [id],
    );

    if (!existingRecord) {
      return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
    }
    try {
      await this.connection.query(
        'UPDATE medicine_category SET medicine_category =? WHERE id = ?',
        [MedicineCategoryEntity.medicine_category, id],
      );

      await this.dynamicConnection.query(
        'update medicine_category SET medicine_category = ? where hospital_medicine_category_id =? and Hospital_id = ?',
        [
          MedicineCategoryEntity.medicine_category,
          id,
          MedicineCategoryEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: 'success',
            messege: 'medicine_category details updated successfully inserted',
            updated_values: await this.connection.query(
              'SELECT * FROM medicine_category WHERE id = ?',
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
      'SELECT id FROM medicine_category WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: 'error', message: `ID ${id} does not exist or It has been already deleted` }];
    }

    try {
      await this.connection.query(
        'DELETE FROM medicine_category WHERE id = ?',
        [id],
      );

      const [medicine_category] = await this.dynamicConnection.query(
        `select id from medicine_category where hospital_medicine_category_id = ? `,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from medicine_category where id = ? and Hospital_id = ?`,
        [medicine_category.id, Hospital_id],
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
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setupPharmacyMedicineCategory(
    search: string,
  ): Promise<SetupPharmacyMedicineCategory[]> {
    let query = ` SELECT * FROM medicine_category `;
    let values = [];
    if (search) {
      query += ` WHERE ( medicine_category.medicine_category LIKE ? ) `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupPharmacyMedicineCategorySearch = await this.connection.query(
      final,
      values,
    );
    return setupPharmacyMedicineCategorySearch;
  }


  async findmedicine_category(limit:number, page:number) {
    try {
      
      const offset = limit * (page - 1);

      const medicine_category = await this.connection.query(`SELECT * FROM medicine_category LIMIT ? OFFSET ?`,[
        Number(limit),Number(offset)
      ])

      let [totallist] = await this.connection.query(`select count(id) as total from medicine_category`)

      let variables = {
        details: medicine_category,
        total: totallist.total,
        page:page,
        limit:limit
      }

      return variables;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
