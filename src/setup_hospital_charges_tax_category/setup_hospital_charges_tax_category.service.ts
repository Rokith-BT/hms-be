import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupHospitalChargesTaxCategory } from "./entities/setup_hospital_charges_tax_category.entity";

@Injectable()
export class tax_categoryservice {
  constructor(
    private readonly connection: DataSource,
        @InjectDataSource('AdminConnection')
        private readonly dynamicConnection: DataSource,
  ) {}
  

  async create(
    tax_categoryEntity: SetupHospitalChargesTaxCategory,
  ): Promise<{ [key: string]: any }[]> {
    try {
      // Check if the tax category already exists
      const [existingTaxCategory] = await this.connection.query(
        `SELECT id FROM tax_category WHERE name = ? LIMIT 1`,
        [tax_categoryEntity.name]
      );
  
      if (existingTaxCategory) {
        return [
          {
            status: process.env.DUPLICATE_NAME,
            message: process.env.EXISTING_RECORD,
          },
        ];
      }
  
      // Insert into main tax_category table
      const result = await this.connection.query(
        'INSERT INTO tax_category (name, percentage) VALUES (?, ?)',
        [tax_categoryEntity.name, tax_categoryEntity.percentage],
      );
  
      // Insert into dynamic database table
      await this.dynamicConnection.query(
        `INSERT INTO tax_category (name, percentage, Hospital_id, hospital_tax_category_id) VALUES (?, ?, ?, ?)`,
        [
          tax_categoryEntity.name,
          tax_categoryEntity.percentage,
          tax_categoryEntity.Hospital_id,
          result.insertId,
        ],
      );
  
      // Fetch inserted data
      const insertedData = await this.connection.query(
        'SELECT * FROM tax_category WHERE id = ?',
        [result.insertId],
      );
  
      return [
        {
          data: {
            id: result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.TAX_CATEGORY,
            inserted_data: insertedData,
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
      const tax_category = await this.connection.query(
        'select id,name,percentage,created_at from tax_category;',
      );
      return tax_category;
    } catch (error) {
      throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
  }

  async findOne(id: number) {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM tax_category WHERE id = ?',
      [id],
    );

    if (!existingRecord || existingRecord.length === 0) {
      throw new HttpException(
        {
          status: process.env.IDENTITY,
          message:  process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const tax_category = await this.connection.query(
        'select id,name,percentage,created_at from tax_category where id = ?',
        [id],
      );
      return tax_category;
    } catch (error) {
      throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }


  async update(
    id: number,
    tax_categoryEntity: SetupHospitalChargesTaxCategory,
  ): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM tax_category WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status: process.env.ERROR, 
         message: process.env.EXISTING_RECORD }];
    }
       try {
      await this.connection.query(
        'update tax_category SET name = ?, percentage = ? where id = ?',
        [tax_categoryEntity.name, tax_categoryEntity.percentage, id],
      );
       await this.dynamicConnection.query(
        'update tax_category SET  name = ?, percentage = ? where hospital_tax_category_id = ? and Hospital_id = ?',
        [
          tax_categoryEntity.name,
          tax_categoryEntity.percentage,
          id,
          tax_categoryEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.CHARGE_CATEGORY_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM tax_category WHERE id = ?',
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
      'SELECT id FROM tax_category WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD }];
    }

    try{
     await this.connection.query(
      'DELETE FROM tax_category WHERE id = ?',
      [id],
    );
      const tax = await this.dynamicConnection.query(
        `select id from tax_category where hospital_tax_category_id = ?`,
        [id],
      );
      const taxes = tax[0].id;
      await this.dynamicConnection.query(
        `delete from tax_category where id = ? and Hospital_id = ?`,
        [taxes, Hospital_id],
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
          status: 'error',
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

  async setupHosChargesTaxCategory(
    search: string,
  ): Promise<SetupHospitalChargesTaxCategory[]> {
    try {
      let query = ` SELECT * FROM tax_category `;
      let values = [];
      if (search) {
        query += ` WHERE ( tax_category.name LIKE ? OR tax_category.percentage LIKE ? )  `;
        values.push('%' + search + '%');
        values.push('%' + search + '%');
      }
      let final = query;
      const setupHospitalChargesTaxCategorySearch = await this.connection.query(
        final,
        values,
      );
      return setupHospitalChargesTaxCategorySearch;
    
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
}


async find_tax_category(limit:number, page:number, search:string) {
  try {
    const offset = limit * (page - 1);
    let dateCondition = '';
    let searchClause = '';

    if(search) {
      const searchClause = `(
      tax_category.name  LIKE '%${search}%' OR 
      tax_category.percentage LIKE '%${search}%')`;

      dateCondition = ` AND ${searchClause}`;
    }

    const tax_category = await this.connection.query(`select tax_category.id as id ,tax_category.name as name, 
      tax_category.percentage,tax_category.created_at from tax_category where tax_category.id  ${dateCondition} LIMIT ? OFFSET ?`,
      [Number(limit),Number(offset)]
    );

    let [totallist] = await this.connection.query(`select count(id) as total FROM tax_category where tax_category.id ${dateCondition}`);

    let variable = {
      details: tax_category,
      total: totallist.total,
      page: page,
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