import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHospitalChargesChargeCategory } from "./entities/setup_hospital_charges_charge_category.entity";


@Injectable()
export class SetupHospitalChargesChargeCategoryService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(
    charge_categoryEntity: SetupHospitalChargesChargeCategory,
  ): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO charge_categories (charge_type_id,name,description,is_default) VALUES (?,?,?,?)',
        [
          charge_categoryEntity.charge_type_id,
          charge_categoryEntity.name,
          charge_categoryEntity.description,
          charge_categoryEntity.is_default,
        ],
      );

      const [charge_category] = await this.dynamicConnection.query(
        `select id from charge_type_master where Hospital_id = ?
   and hospital_charge_type_master_id = ?`,
        [
          charge_categoryEntity.Hospital_id,
          charge_categoryEntity.charge_type_id,
        ],
      );

      await this.dynamicConnection.query(
        `INSERT INTO charge_categories (charge_type_id,name,description,short_code,is_default,Hospital_id,hospital_charge_categories_id) values (?,?,?,?,?,?,?)`,
        [
          charge_category.id,
          charge_categoryEntity.name,
          charge_categoryEntity.description,
          charge_categoryEntity.short_code,
          charge_categoryEntity.is_default,
          charge_categoryEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          data: {
            'id ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_CATEGORY_ADDED,
            inserted_data: await this.connection.query(
              'SELECT * FROM charge_categories WHERE id = ?',
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

  async findAll() {
    try {
      const charge_category = await this.connection
        .query(`select charge_categories.id,charge_type_master.charge_type,charge_categories.charge_type_id,charge_categories.name,charge_categories.description,charge_categories.short_code,charge_categories.is_default,
  charge_categories.created_at from charge_categories
  join charge_type_master ON charge_categories.charge_type_id = charge_type_master.id;`);
      return charge_category;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id: string): Promise<SetupHospitalChargesChargeCategory[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_categories WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const charge_category = await this.connection.query(
        'SELECT * FROM charge_categories WHERE id = ?',
        [id],
      );
      return charge_category
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);  
      }
  }

  async update(
    id: string,
    charge_categoryEntity: SetupHospitalChargesChargeCategory,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM charge_categories WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'UPDATE charge_categories SET charge_type_id =?,name =?,description =?  WHERE id = ?',
        [
          charge_categoryEntity.charge_type_id,
          charge_categoryEntity.name,
          charge_categoryEntity.description,
          id,
        ],
      );
      const [charge_type] = await this.dynamicConnection.query(
        `select charge_type_id from charge_categories where hospital_charge_categories_id = ? and Hospital_id = ? `,
        [id, charge_categoryEntity.Hospital_id],
      );

      await this.dynamicConnection.query(
        'update charge_categories SET  charge_type_id =?,name =?,description =? where hospital_charge_categories_id = ? and Hospital_id = ?',
        [
          charge_type.charge_type_id,
          charge_categoryEntity.name,
          charge_categoryEntity.description,
          id,
          charge_categoryEntity.Hospital_id,
        ],
      );

      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.CHARGE_CATEGORY_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM charge_categories WHERE id = ?',
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
      'SELECT id FROM charge_categories WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'DELETE FROM charge_categories WHERE id = ?',
        [id],
      );


      const charge_cate = await this.dynamicConnection.query(
        `select id from charge_categories where hospital_charge_categories_id = ?`,
        [id],
      );
      const charge_category = charge_cate[0].id;

      await this.dynamicConnection.query(
        `delete from charge_categories where id = ? and Hospital_id = ?`,
        [charge_category, Hospital_id],
      );

      return [
        {
          status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
        },
      ];
    } catch (error) {
      if (
      error.code === 'ER_ROW_IS_REFERENCED_2' || 
      error.errno === 1451 
    ) {
      return [
        {
          status: process.env.ERROR,
          message: `Cannot delete ID ${id} because it is in use (foreign key constraint).`,
        },
      ];
    }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async HospitalChargesChargeCategory(
    search: string,
  ): Promise<SetupHospitalChargesChargeCategory[]> {
    let query = ` select charge_categories.id,charge_type_master.charge_type,charge_categories.charge_type_id,charge_categories.name,charge_categories.description,charge_categories.short_code,charge_categories.is_default,
  charge_categories.created_at from charge_categories
  join charge_type_master ON charge_categories.charge_type_id = charge_type_master.id `;
    let values = [];
    if (search) {
      query += ` WHERE ( charge_categories.name LIKE ? OR charge_type_master.charge_type LIKE ? OR charge_categories.description LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupHospitalChargesChargeCategorySearch =
      await this.connection.query(final, values);

    return setupHospitalChargesChargeCategorySearch;
  }

  async find_charge_category(limit:number, page:number, search:string) {
    try {

      const offset = limit * (page - 1);
      let dateCondition = '';
      let searchClause = '';


      if(search) {
        const searchClause = `(
        charge_categories.name LIKE '%${search}%' OR
        charge_type_master.charge_type LIKE '%${search}%' OR
        charge_categories.description LIKE '%${search}%'
        )`

        dateCondition += ` AND ${searchClause}`;
      }
        
      const charge_category = await this.connection.query(`select charge_categories.id,
        charge_type_master.charge_type,charge_categories.charge_type_id,
        charge_categories.name,charge_categories.description,charge_categories.short_code,
        charge_categories.is_default,charge_categories.created_at 
        from charge_categories
        join charge_type_master ON charge_categories.charge_type_id = charge_type_master.id ${dateCondition} LIMIT ? OFFSET ?`,
      [Number(limit),Number(offset)]);

      let [totallist] = await this.connection.query(`select count(id) as total FROM charge_categories`);

      let variable = {
        details: charge_category,
        total: totallist.total,
        page:page,
        limit: limit
      }

      return variable;

    }  catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
