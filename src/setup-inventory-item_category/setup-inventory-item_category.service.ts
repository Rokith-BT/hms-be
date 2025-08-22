import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupInventoryItemCategory } from "./entities/setup-inventory-item_category.entity";
import { CountDto } from "./dto/setup-inventory-item_category.dto";



@Injectable()
export class SetupInventoryItemCategoryService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(item_categoryEntity: SetupInventoryItemCategory): Promise<{ [key: string]: any }[]> {
    try {
      const [existing_item_category] = await this.connection.query(`select id from item_category where item_category = ? LIMIT 1`,
      [item_categoryEntity.item_category]
      )

      if (existing_item_category) {
        return [
          {
          status: process.env.DUPLICATE_NAME,
          message: process.env.ITEM_CATEGORY_EXIST,
          }
        ]
      }

      const result = await this.connection.query(
        'INSERT INTO item_category (item_category,is_active,description) VALUES (?,?,?)',
        [item_categoryEntity.item_category,
        item_categoryEntity.is_active,
        item_categoryEntity.description,
        ]
      );
      await this.dynamicConnection.query(`INSERT INTO item_category (item_category,is_active,description,Hospital_id,hospital_item_category_id) VALUES (?,?,?,?,?)`, [
        item_categoryEntity.item_category,
        item_categoryEntity.is_active,
        item_categoryEntity.description,
        item_categoryEntity.Hospital_id,
        result.insertId
      ])
      return [{
        "data ": {
          "id  ": result.insertId,
          "status":process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_CATEGORY,
          "inserted_data": await this.connection.query('SELECT * FROM item_category WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);  }
  }

  async findAll(): Promise<SetupInventoryItemCategory[]> {
    try {
      const item_category = await this.connection.query('SELECT * FROM item_category');
      return item_category;
    } catch (error) {
 throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
  }

  async findOne(id: string): Promise<SetupInventoryItemCategory | null> {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM item_category WHERE id = ?',
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
      const item_category = await this.connection.query('SELECT * FROM item_category WHERE id = ?', [id]);

      return item_category;
    } catch (error) {
       throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
 
    
  }

  async update(id: string, item_categoryEntity: SetupInventoryItemCategory): Promise<{ [key: string]: any }[]> {

    const [existing_item_category] = await this.connection.query(`
      select id from item_category where id = ?`,[id])


      if(!existing_item_category)  
          { return [{ status: process.env.ERROR, 
        message: process.env.EXISTING_RECORD }];
    }

    try {
      await this.connection.query(
        'UPDATE item_category SET item_category =?,  description =? WHERE id = ?',
        [item_categoryEntity.item_category,
        item_categoryEntity.description,
          id
        ]
      );
      await this.dynamicConnection.query(
        'update item_category SET item_category =?,  description =?  where hospital_item_category_id = ? and Hospital_id= ?',

        [
          item_categoryEntity.item_category,
          item_categoryEntity.description,
          id,
          item_categoryEntity.Hospital_id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_CATEGORY_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM item_category WHERE id = ?', [id])
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

    const [existing_item_category] = await this.connection.query(`SELECT id FROM item_category WHERE id = ?`,[id]);

    if (!existing_item_category) {
      return [{ status:  process.env.ERROR,
        message: process.env.EXISTING_RECORD, }];
    }

    try {
      await this.connection.query('DELETE FROM item_category WHERE id = ?', [id]);

      const [admin] = await this.dynamicConnection.query(`select id from item_category where hospital_item_category_id = ?`, [id])

      await this.dynamicConnection.query(`delete from item_category where id = ? and Hospital_id = ?`, [
        admin.id, Hospital_id
      ])

      return [{
        "status":  process.env.SUCCESS_STATUS_V2,
        "message": process.env.DELETED
      }
      ];

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
   
  }



  async setupinventoryItemCategory(
    search: string,
  ): Promise<SetupInventoryItemCategory[]> {


    let query = ` SELECT * FROM item_category `;
    let values = [];

    if (search) {


      query += ` WHERE ( item_category.item_category LIKE ? )  `;
      values.push('%' + search + '%');
    }


    let final = query;

    const setupinventoryItemCategorySearch = await this.connection.query(final, values);

    return setupinventoryItemCategorySearch;

  }

  async findALLitem_category(limit:number,page:number) {
    try {
      
      const offset = limit * (page - 1);
      

      const item_category = await this.connection.query(`select * from item_category LIMIT ? OFFSET ?`,[
        Number(limit),Number(offset)
      ]);

      let [totallist] = await this.connection.query(`select count(id) as total from item_category`)

      let variables = {
        details: item_category,
        total: totallist.total
      }

      return variables;

    } catch (error) {
     throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findInventoryItemCategorySearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM item_category `;

    let countQuery = `
      SELECT COUNT(item_category.id) AS total FROM item_category `;

    if (search) {

      const condition = `
      WHERE item_category.item_category LIKE ? `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern);
    }

    baseQuery += ` ORDER BY item_category.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ItemCategorySearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ItemCategorySearch,
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
