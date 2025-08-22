import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class InternalOpdMedicationMedicationNameService {
  constructor(private readonly connection: DataSource) { }

  async findall(medicine_category_id: number) {
    try {
      const medication_name = await this.connection.query(`select pharmacy.id, pharmacy.medicine_name from pharmacy where pharmacy.medicine_category_id = ?`, [medicine_category_id]);
      return medication_name;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}

