import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupInventoryItemStore } from "./entities/setup-inventory-item_store.entity";
import { CountDto } from "./dto/setup-inventory-item_store.dto";



@Injectable()
export class SetupInventoryItemStoreService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(item_storeEntity: SetupInventoryItemStore): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO item_store (item_store,code,description) VALUES (?,?,?)',
        [item_storeEntity.item_store,
        item_storeEntity.code,
        item_storeEntity.description,

        ]
      );


      await this.dynamicConnection.query(`INSERT INTO item_store (item_store,code,description,Hospital_id,hospital_item_store_id) VALUES (?,?,?,?,?)`, [
        item_storeEntity.item_store,
        item_storeEntity.code,
        item_storeEntity.description,
        item_storeEntity.Hospital_id,
        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_STORE,
          "inserted_data": await this.connection.query('SELECT * FROM item_store WHERE id = ?', [result.insertId])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SetupInventoryItemStore[]> {
    try {
      const item_store = await this.connection.query('SELECT * FROM item_store');
      return item_store;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
  async findOne(id: string): Promise<SetupInventoryItemStore | null> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM item_store WHERE id = ?`, [
      id
    ])

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
      const item_store = await this.connection.query('SELECT * FROM item_store WHERE id = ?', [id]);

      if (item_store.length === 1) {
        return item_store;
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
  async update(id: string, item_storeEntity: SetupInventoryItemStore): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM item_store WHERE id = ?`, [
      id
    ])

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
      await this.connection.query(
        'UPDATE item_store SET item_store =?, code =?, description =? WHERE id = ?',
        [item_storeEntity.item_store,
        item_storeEntity.code,
        item_storeEntity.description,
          id
        ]
      );
      await this.dynamicConnection.query(
        'update item_store SET item_store =?, code =?, description =? where hospital_item_store_id = ? and Hospital_id= ?',

        [
          item_storeEntity.item_store,
          item_storeEntity.code,
          item_storeEntity.description,
          id,
          item_storeEntity.Hospital_id
        ]
      )

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_STORE_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM item_store WHERE id = ?', [id])
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

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM item_store WHERE id = ?`, [
      id
    ])

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
      await this.connection.query('DELETE FROM item_store WHERE id = ?', [id]);
      const [admin] = await this.dynamicConnection.query(`select id from item_store where hospital_item_store_id = ?`, [id])
      await this.dynamicConnection.query(`delete from item_store where id = ? and Hospital_id = ?`, [admin.id, Hospital_id])

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }


    return [{
      "status": process.env.SUCCESS_STATUS_V2,
      "message": process.env.DELETED
    }
    ];
  }



  async setupInventoryItemStore(
    search: string,
  ): Promise<SetupInventoryItemStore[]> {


    let query = ` SELECT * FROM item_store `;
    let values = [];

    if (search) {


      query += ` WHERE ( item_store.item_store LIKE ? OR item_store.code LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }


    let final = query;

    const setupInventoryItemStoreSearch = await this.connection.query(final, values);

    return setupInventoryItemStoreSearch;

  }



  async findInventoryItemStoreSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try {

      let baseQuery = `
      SELECT * FROM item_store `;

      let countQuery = `
      SELECT COUNT(item_store.id) AS total FROM item_store `;

      if (search) {

        const condition = `
      WHERE item_store.item_store LIKE ? OR item_store.code LIKE ? `;

        baseQuery += condition;
        countQuery += condition;

        const pattern = `%${search}%`;
        values.push(pattern, pattern);
      }

      baseQuery += ` ORDER BY item_store.id DESC LIMIT ? OFFSET ? `;
      const paginatedValues = [...values, Number(limit), Number(offset)];

      const ItemStoreSearch = await this.connection.query(baseQuery, paginatedValues);
      const [countResult] = await this.connection.query(countQuery, values);

      return {
        details: ItemStoreSearch,
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
