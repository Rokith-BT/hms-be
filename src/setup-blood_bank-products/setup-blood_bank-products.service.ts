import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SetupBloodBankProduct } from "./entities/setup-blood_bank-product.entity";


@Injectable()
export class SetupBloodBankProductsService {
  constructor(private readonly connection: DataSource) {}

  async create(
    bloodproductsEntity: SetupBloodBankProduct,
  ): Promise<{ [key: string]: any }[]> {
    try {
      const result = await this.connection.query(
        'INSERT INTO blood_bank_products (name,is_blood_group) VALUES (?,?)',
        [bloodproductsEntity.name, bloodproductsEntity.is_blood_group],
      );

      return [
        {
          'data ': {
            'id  ': result.insertId,
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BLOOD_BANK,
            inserted_data: await this.connection.query(
              'SELECT * FROM blood_bank_products WHERE id = ?',
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

  async findAll(): Promise<SetupBloodBankProduct[]> {
    try {
       const blood_bank_products = await this.connection.query(
      'SELECT * FROM blood_bank_products where is_blood_group = ?',
      ['1'],
    );
    return blood_bank_products;
    } catch (error) {
        throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
   
  }

  async findOne(id: string): Promise<SetupBloodBankProduct | null> {
    try{
    const blood_bank_products = await this.connection.query(
      'SELECT * FROM blood_bank_products WHERE id = ?',
      [id],
    );
    if (blood_bank_products.length === 1) {
      return blood_bank_products;
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

  async update(
    id: string,
    bloodproductsEntity: SetupBloodBankProduct,
  ): Promise<{ [key: string]: any }[]> {
    try {
       await this.connection.query(
        'UPDATE blood_bank_products SET name =? ,is_blood_group =?  WHERE id = ?',
        [bloodproductsEntity.name, bloodproductsEntity.is_blood_group, id],
      );
      return [
        {
          'data ': {
            status: 'success',
            messege: 'blood_bank_products details updated successfully ',
            updated_values: await this.connection.query(
              'SELECT * FROM blood_bank_products WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    } catch (error) {
      return [
        {
          status: 'failed',
          messege: 'cannot update blood_bank_products profile',
          error: error,
        },
      ];
    }
  }

  async remove(id: string): Promise<{ [key: string]: any }[]> {
    await this.connection.query(
      'DELETE FROM blood_bank_products WHERE id = ?',
      [id],
    );
    return [
      {
        status: 'success',
        message: ' id: ' + id + ' deleted successfully',
      },
    ];
  }

  async SetupBloodBankProducts(
    search: string,
  ): Promise<SetupBloodBankProduct[]> {
    let query = ` SELECT * FROM blood_bank_products where is_blood_group = 1 `;
    let values = [];
    if (search) {
      query += ` and ( blood_bank_products.name LIKE ? )  `;
      values.push('%' + search + '%');
    }
    let final = query;
    const setupBloodBankProduct = await this.connection.query(final, values);
    return setupBloodBankProduct;
  }
}
