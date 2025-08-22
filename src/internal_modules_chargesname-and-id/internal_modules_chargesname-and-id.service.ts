import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InternalModulesChargesnameAndIdService {
  constructor(private readonly connection: DataSource) { }

  async findall(charge_category_id: number) {
    try {
      const charges = await this.connection.query(`select charges.id,charges.name from charges where charge_category_id = ?`, [charge_category_id]);
      return charges;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async findcharges(standard_charge: number) {
    try {
      const charges_amount = await this.connection.query(`select charges.standard_charge,tax_category.percentage tax_percentage, round((charges.standard_charge+
     (charges.standard_charge*((tax_category.percentage)/100))),2) amount from
   charges join tax_category on charges.tax_category_id = tax_category.id
 where charges.id = ?`, [standard_charge])
      return charges_amount;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  async find_slot_name() {
    try {
      const slot = await this.connection.query(`select * from doctor_shift`);
      return slot;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }
}
