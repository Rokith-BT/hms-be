import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InternalOpdMedicationMedicationDoseService {
  constructor(private readonly connection: DataSource) { }
  async findall(medicine_category_id: number) {
    try {
      const medication_dose = await this.connection.query(`select medicine_dosage.id, medicine_dosage.dosage from medicine_dosage where medicine_dosage.medicine_category_id = ?`, [medicine_category_id]);
      return medication_dose;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }


  }

}
