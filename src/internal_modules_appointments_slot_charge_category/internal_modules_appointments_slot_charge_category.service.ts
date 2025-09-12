import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class InternalModulesAppointmentsSlotChargeCategoryService {

  constructor(private readonly connection: DataSource
  ) { }

  async findone() {
    try {
      const charge_category = await this.connection.query(`    select distinct charge_categories.name,charge_categories.id ,charge_type_module.module_shortcode
    from  charge_type_module join charge_categories on charge_categories.charge_type_id = charge_type_module.charge_type_master_id
    where charge_type_module.module_shortcode = "appointment"`)
      return charge_category;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


}