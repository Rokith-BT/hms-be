import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SetupApptSlotAmount } from "./entities/setup_appt_slot_amount.entity";


@Injectable()
export class SetupApptSlotAmountService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(slotEntity: SetupApptSlotAmount) {

    try {
      const [check] = await this.connection.query(
        'select id from shift_details where staff_id = ?',
        [slotEntity.staff_id],
      );

      const [getStaffMail] = await this.connection.query(
        `select email from staff where id = ?`,
        [slotEntity.staff_id],
      );

      const [getAdminStaff] = await this.dynamicConnection.query(
        `select id from staff where email = ?`,
        [getStaffMail.email],
      );

      const [getAdminChargeId] = await this.dynamicConnection.query(
        `select id from charges 
where Hospital_id = ? and hospital_charges_id = ? `,
        [slotEntity.Hospital_id, slotEntity.charge_id],
      );

      if (check) {
        await this.connection.query(
          `
    update shift_details set 
    consult_duration = ? ,charge_id = ?
     where id = ? `,
          [slotEntity.consult_duration, slotEntity.charge_id, check.id],
        );
        const [getAdminShift] = await this.dynamicConnection.query(
          `select id from shift_details
     where Hospital_id = ? and hospital_shift_details_id = ?`,
          [slotEntity.Hospital_id, check.id],
        );

        const updateQuery = `
  update shift_details
  set consult_duration = ?,
      charge_id = ?
  where id = ?
`;
        await this.dynamicConnection.query(
          updateQuery,
          [slotEntity.consult_duration, getAdminChargeId.id, getAdminShift.id],
        );

        return [
          {
            data: {
              status: process.env.SUCCESS_STATUS_V2,
              messege: process.env.SHIFT_DETAILS_UPDATED,
            },
          },
        ];
      } else {
        const insert = await this.connection.query(
          `insert into shift_details(staff_id,
    consult_duration,
    charge_id
    ) values (?,?,?)`,
          [
            slotEntity.staff_id,
            slotEntity.consult_duration,
            slotEntity.charge_id,
          ],
        );

        await this.dynamicConnection.query(
          `insert into shift_details(staff_id,
    consult_duration,
    charge_id,Hospital_id,hospital_shift_details_id) values (?,?,?,?,?)`,
          [
            getAdminStaff.id,
            slotEntity.consult_duration,
            getAdminChargeId.id,
            slotEntity.Hospital_id,
            insert.insertId,
          ],
        );

        return [
          {
            data: {
              id: insert.insertId,
              status: process.env.SUCCESS_STATUS_V2,
              messege: process.env.SHIFT_DETAILS,
              inserted_data: await this.connection.query(
                'SELECT * FROM shift_details WHERE id = ?',
                [insert.insertId],
              ),
            },
          },
        ];
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findforDocAndGlobalShift(staff_id: number) {
    try {
      const getCharge = await this.connection.query(
        `select shift_details.id, shift_details.consult_duration,charges.name charge_name,
    charges.charge_category_id,charges.id as charge_id,charges.standard_charge,round((charges.standard_charge+
      (charges.standard_charge*((tax_category.percentage)/100))),2) amount,charge_categories.name charge_category_name
     from shift_details left join charges on charges.id = shift_details.charge_id
     left join charge_categories on charge_categories.id = charges.charge_category_id 
     left join tax_category on charges.tax_category_id = tax_category.id where shift_details.staff_id = ?`,
        [staff_id],
      );

      return getCharge;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, slotEntity: SetupApptSlotAmount) {
    try {
      const [existingRecord] = await this.connection.query(
        'SELECT id FROM shift_details WHERE id = ?',
        [id],
      );

      if (!existingRecord) {
        return [{ status: process.env.ERROR,
           message: process.env.EXISTING_RECORD }];
      }

      await this.connection.query(
        `update shift_details set consult_duration = ? ,charge_id = ? where id = ?`,
        [slotEntity.consult_duration, slotEntity.charge_id, id],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.SHIFT_DETAILS_UPDATED,
            updated_values: await this.connection.query(
              'SELECT * FROM shift_details WHERE id = ?',
              [id],
            ),
          },
        },
      ];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async remove(id: number) {

    const [existingRecord] = await this.connection.query(
      'SELECT id FROM shift_details WHERE id = ?',
      [id],
    );

    if (!existingRecord) {
      return [{ status:  process.env.ERROR,
         message: process.env.EXISTING_RECORD  }];
    }

    try {
      await this.connection.query(
        'delete from shift_details where id = ?',
        [id],
      );
      return [
        {
          status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED,
        },
      ];
    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR
      )

    }

  }
}
