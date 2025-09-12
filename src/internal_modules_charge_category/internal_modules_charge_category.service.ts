import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InternalModulesChargeCategoryService {
  constructor(private readonly connection: DataSource) { }
  async findall(charge_type_id: number) {
    try {
      const charge_category = await this.connection.query('select charge_categories.id, charge_categories.name from charge_categories where charge_categories.charge_type_id = ? ', [charge_type_id]);
      return charge_category;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }


  }

}

