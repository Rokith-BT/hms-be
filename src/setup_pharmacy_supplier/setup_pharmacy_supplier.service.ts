import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupPharmacySupplier } from "./entities/setup_pharmacy_supplier.entity";


@Injectable()
export class SetupPharmacySupplierService {
  constructor(
   private readonly connection: DataSource,
       @InjectDataSource('AdminConnection')
       private readonly dynamicConnection: DataSource,
  ) {}

  async create(
    supplierEntity: SetupPharmacySupplier,
  ): Promise<{ [key: string]: any }[]> {
   
    try {
      const result = await this.connection.query(
        'INSERT INTO medicine_supplier (supplier,contact,supplier_person,supplier_person_contact,supplier_drug_licence,address) VALUES (?,?,?,?,?,?)',
        [
          supplierEntity.supplier,
          supplierEntity.contact,
          supplierEntity.supplier_person,
          supplierEntity.supplier_person_contact,
          supplierEntity.supplier_drug_licence,
          supplierEntity.address,
        ],
      );

      await this.dynamicConnection.query(
        'INSERT INTO medicine_supplier (supplier,contact,supplier_person,supplier_person_contact,supplier_drug_licence,address,Hospital_id,hospital_medicine_supplier_id) values (?,?,?,?,?,?,?,?)',
        [
          supplierEntity.supplier,
          supplierEntity.contact,
          supplierEntity.supplier_person,
          supplierEntity.supplier_person_contact,
          supplierEntity.supplier_drug_licence,
          supplierEntity.address,
          supplierEntity.Hospital_id,
          result.insertId,
        ],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: 'success',
            messege: 'medicine_supplier details added successfully ',
            inserted_data: await this.connection.query(
              'SELECT * FROM medicine_supplier WHERE id = ?',
              [result.insertId],
            ),
          },
        },
      ];
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
  }

  async findAll(): Promise<SetupPharmacySupplier[]> {
    try {
      const supplier = await this.connection.query(
        'SELECT * FROM medicine_supplier',
      );
      return supplier;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVER IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }

  async findOne(id: string): Promise<SetupPharmacySupplier | null> {

    const[existingRecord] = await this.connection.query(`SELECT * FROM medicine_supplier WHERE id = ?`,[id]);

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
      const supplier = await this.connection.query(
        'SELECT * FROM medicine_supplier WHERE id = ?',
        [id],
      );
  
        return supplier;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVER IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
   
  }

  async update(
    id: string,
    supplierEntity: SetupPharmacySupplier,
  ): Promise<{ [key: string]: any }[]> {
    
    
    const[existingRecord] = await this.connection.query(`SELECT * FROM medicine_supplier WHERE id = ?`,[id]);

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
       await this.connection.query(
        'UPDATE medicine_supplier SET supplier =?,contact =?,supplier_person =?,supplier_person_contact =?,supplier_drug_licence =?,address =? WHERE id = ?',
        [
          supplierEntity.supplier,
          supplierEntity.contact,
          supplierEntity.supplier_person,
          supplierEntity.supplier_person_contact,
          supplierEntity.supplier_drug_licence,
          supplierEntity.address,
          id,
        ],
      );

      await this.dynamicConnection.query(
        'update medicine_supplier SET supplier =?,contact =?,supplier_person =?,supplier_person_contact =?,supplier_drug_licence =?,address =? where hospital_medicine_supplier_id =? and Hospital_id =?',
        [
          supplierEntity.supplier,
          supplierEntity.contact,
          supplierEntity.supplier_person,
          supplierEntity.supplier_person_contact,
          supplierEntity.supplier_drug_licence,
          supplierEntity.address,
          id,
          supplierEntity.Hospital_id,
        ],
      );
      return [
        {
          'data ': {
            status: 'success',
            message: 'supplier details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM medicine_supplier WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVER IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(
    id: string,
    Hospital_id: number,
  ): Promise<{ [key: string]: any }[]> {

    const[existingRecord] = await this.connection.query(`SELECT * FROM medicine_supplier WHERE id = ?`,[id]);

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
       await this.connection.query(
        'DELETE FROM medicine_supplier WHERE id = ?',
        [id],
      );

      const [adminresult] = await this.dynamicConnection.query(
        `select id from medicine_supplier where hospital_medicine_supplier_id = ?`,
        [id],
      );

      await this.dynamicConnection.query(
        `delete from medicine_supplier where id = ? and Hospital_id = ?`,
        [adminresult.id, Hospital_id],
      
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
        message: `THE API SERVER IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    } 
   
  }

  async findallpharmacy_supplier(limit:number, page:number) {
   
    try {
      const offset = limit * (page - 1)

      const suppliers = await this.connection.query(`SELECT * FROM medicine_supplier LIMIT ? OFFSET ? `,
        [
          Number(limit),Number(offset)
        ]
      )

      let [totallist] = await this .connection.query(`select count(id) as total from medicine_supplier`)

      let variables = {
        details: suppliers,
        total: totallist.total,
        page:page,
            limit:limit,
      }

      return variables;

    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `THE API SERVER IS TEMPORARILY UNAVAILABLE.PLEASE TRY AGAIN LATER`,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
