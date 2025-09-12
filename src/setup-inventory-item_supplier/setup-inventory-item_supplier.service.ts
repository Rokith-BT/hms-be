import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupInventoryItemSupplier } from "./entities/setup-inventory-item_supplier.entity";
import {CountDto} from "./dto/setup-inventory-item_supplier.dto";


@Injectable()
export class SetupInventoryItemSupplierService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(item_supplierEntity: SetupInventoryItemSupplier): Promise<{ [key: string]: any }[]> {

    try {
      const result = await this.connection.query(
        'INSERT INTO item_supplier (item_supplier,phone,email,address,contact_person_name,contact_person_phone,contact_person_email,description) VALUES (?,?,?,?,?,?,?,?)',
        [item_supplierEntity.item_supplier,
        item_supplierEntity.phone,
        item_supplierEntity.email,
        item_supplierEntity.address,
        item_supplierEntity.contact_person_name,
        item_supplierEntity.contact_person_phone,
        item_supplierEntity.contact_person_email,
        item_supplierEntity.description
        ]
      );

      await this.dynamicConnection.query('INSERT INTO item_supplier (item_supplier,phone,email,address,contact_person_name,contact_person_phone,contact_person_email,description,Hospital_id,hospital_item_supplier_id) VALUES (?,?,?,?,?,?,?,?,?,?)', [
        item_supplierEntity.item_supplier,
        item_supplierEntity.phone,
        item_supplierEntity.email,
        item_supplierEntity.address,
        item_supplierEntity.contact_person_name,
        item_supplierEntity.contact_person_phone,
        item_supplierEntity.contact_person_email,
        item_supplierEntity.description,
        item_supplierEntity.Hospital_id,
        result.insertId
      ])

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_SUPPLIER,
          "inserted_data": await this.connection.query('SELECT * FROM item_supplier WHERE id = ?', [result.insertId])
        }
      }];
    }
    catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }



  async findAll(): Promise<SetupInventoryItemSupplier[]> {
    try {
        const item_supplier = await this.connection.query('SELECT * FROM item_supplier');
    return item_supplier;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
  }


  async findOne(id: string): Promise<SetupInventoryItemSupplier | null> {

    const [EXISTING_RECORD] = await this.connection.query(`
      SELECT id FROM item_supplier WHERE id = ?`,[
        id
      ])

      if (!EXISTING_RECORD || EXISTING_RECORD.length === 0){
        throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
      }
    try {
       const item_supplier = await this.connection.query('SELECT * FROM item_supplier WHERE id = ?', [id]);

    if (item_supplier.length === 1) {
      return item_supplier;
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


  async update(id: string, item_supplierEntity: SetupInventoryItemSupplier): Promise<{ [key: string]: any }[]> {

    const [existingRecord] = await this.connection.query(`
      SELECT id FROM item_supplier WHERE id = ?`,[id])

      if(!existingRecord || existingRecord.length === 0)
{
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
        'UPDATE item_supplier SET item_supplier =?, phone =?, email =?, address =?, contact_person_name =?, contact_person_phone =?, contact_person_email =?, description =?  WHERE id = ?',
        [item_supplierEntity.item_supplier,
        item_supplierEntity.phone,
        item_supplierEntity.email,
        item_supplierEntity.address,
        item_supplierEntity.contact_person_name,
        item_supplierEntity.contact_person_phone,
        item_supplierEntity.contact_person_email,
        item_supplierEntity.description,
          id
        ]
      );
      await this.dynamicConnection.query(
        `update item_supplier SET item_supplier =?, phone =?, email =?, address =?, contact_person_name =?, contact_person_phone =?, contact_person_email =?, description =?  where hospital_item_supplier_id = ? and Hospital_id = ?`,
        [
          item_supplierEntity.item_supplier,
          item_supplierEntity.phone,
          item_supplierEntity.email,
          item_supplierEntity.address,
          item_supplierEntity.contact_person_name,
          item_supplierEntity.contact_person_phone,
          item_supplierEntity.contact_person_email,
          item_supplierEntity.description,
          id,
          item_supplierEntity.Hospital_id
        ]
      );

      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.ITEM_SUPPLIER_UPDATE,
          "updated_values": await this.connection.query('SELECT * FROM item_supplier WHERE id = ?', [id])
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
      SELECT id FROM item_supplier WHERE id = ?`,[id])

      if(!existingRecord || existingRecord.length === 0)
{
  throw new HttpException(
        {
          status: process.env.IDENTITY,
          message: process.env.EXISTING_RECORD,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
       await this.connection.query('DELETE FROM item_supplier WHERE id = ?', [id]);
      const [admin] = await this.dynamicConnection.query(`select id from item_supplier where hospital_item_supplier_id = ?`, [id])
      await this.dynamicConnection.query(`delete from item_supplier where id = ? and Hospital_id = ?`, [admin.id, Hospital_id])
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
  async setupInventoryItemSupplier(
    search: string,
  ): Promise<SetupInventoryItemSupplier[]> {
    let query = ` SELECT * FROM item_supplier `;
    let values = [];
    if (search) {
      query += ` WHERE ( item_supplier.item_supplier LIKE ? OR item_supplier.phone LIKE ? OR item_supplier.email LIKE ? OR item_supplier.address LIKE ? OR item_supplier.contact_person_name LIKE ? OR item_supplier.contact_person_email LIKE ? OR item_supplier.contact_person_phone LIKE ? )  `;
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
      values.push('%' + search + '%');
    }
    let final = query;
    const setupInventoryItemSupplierSearch = await this.connection.query(final, values);
    return setupInventoryItemSupplierSearch;
  }



  async findInventoryItemSupplierSearch(
    search: string,
    limit: number,
    page: number
  ): Promise<CountDto> {

    const offset = limit * (page - 1);
    let values: any[] = [];

    try{

      let baseQuery = `
      SELECT * FROM item_supplier `;

    let countQuery = `
      SELECT COUNT(item_supplier.id) AS total FROM item_supplier `;

    if (search) {

      const condition = `
      WHERE ( item_supplier.item_supplier LIKE ? OR item_supplier.phone LIKE ? OR item_supplier.email LIKE ? OR item_supplier.address LIKE ? OR item_supplier.contact_person_name LIKE ? OR item_supplier.contact_person_email LIKE ? OR item_supplier.contact_person_phone LIKE ? ) `;

    baseQuery += condition;
    countQuery += condition;

    const pattern = `%${search}%`;
    values.push(pattern,pattern,pattern,pattern,pattern,pattern,pattern);
    }

    baseQuery += ` ORDER BY item_supplier.id DESC LIMIT ? OFFSET ? `;
    const paginatedValues = [...values, Number(limit), Number(offset)];

    const ItemSupplierSearch = await this.connection.query(baseQuery, paginatedValues);
    const [countResult] = await this.connection.query(countQuery, values);

    return {
      details: ItemSupplierSearch,
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
