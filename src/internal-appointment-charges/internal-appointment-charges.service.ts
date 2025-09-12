import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalAppointmentChargesService {
  constructor(private readonly connection: DataSource
  ) { }

  async findAll(staff_id: number) {
    try {
      const charges = await this.connection.query(`select shift_details.staff_id, charges.id charge_id, format((charges.standard_charge+(charges.standard_charge*((tax_category.percentage)/100))),2) amount from
  charges left join tax_category on charges.tax_category_id = tax_category.id 
  left join shift_details on shift_details.charge_id = charges.id
where shift_details.staff_id = ?`, [staff_id])
      return charges;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}
