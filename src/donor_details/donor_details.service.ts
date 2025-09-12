import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DonorDetail } from "./entities/donor_detail.entity";


@Injectable()
export class DonorDetailsService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createDonorDetail: DonorDetail) {
    try {
      const addDonorDetail = await this.connection.query(
        `INSERT into blood_donor(
    donor_name,
    date_of_birth,
    blood_bank_product_id,
    gender,
    father_name,
    address,
    contact_no
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          createDonorDetail.donor_name,
          createDonorDetail.date_of_birth,
          createDonorDetail.blood_bank_product_id,
          createDonorDetail.gender,
          createDonorDetail.father_name,
          createDonorDetail.address,
          createDonorDetail.contact_no
        ],
      )

      const addaddDonorDetailID = addDonorDetail.insertId;
      const dynBloodBankProducts = await this.dynamicConnection.query('SELECT id FROM blood_bank_products WHERE hospital_blood_bank_products_id = ? and Hospital_id=?', [createDonorDetail.blood_bank_product_id, createDonorDetail.hospital_id]);
      const dynBloodBankProductsID = dynBloodBankProducts[0].id;
      await this.dynamicConnection.query(
        `INSERT into blood_donor(
    donor_name,
    date_of_birth,
    blood_bank_product_id,
    gender,
    father_name,
    address,
    contact_no,
    hospital_id,
    hos_blood_donor_id
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          createDonorDetail.donor_name,
          createDonorDetail.date_of_birth,
          dynBloodBankProductsID,
          createDonorDetail.gender,
          createDonorDetail.father_name,
          createDonorDetail.address,
          createDonorDetail.contact_no,
          createDonorDetail.hospital_id,
          addaddDonorDetailID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.BLOOD_DONAR,
          "Donor_Details_Values": await this.connection.query('SELECT * FROM blood_donor WHERE id = ?', [addaddDonorDetailID])
        }
      }];

    }
    catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async updateBloodDonorDetail(id: number, createDonorDetail: DonorDetail) {
    try {
      await this.connection.query(`update blood_donor SET
    donor_name=?,
    date_of_birth=?,
    blood_bank_product_id=?,
    gender=?,
    father_name=?,
    address=?,
    contact_no=?
    where id=?`,
        [
          createDonorDetail.donor_name,
          createDonorDetail.date_of_birth,
          createDonorDetail.blood_bank_product_id,
          createDonorDetail.gender,
          createDonorDetail.father_name,
          createDonorDetail.address,
          createDonorDetail.contact_no,
          id
        ],
      )
      const [dynBloodDonor] = await this.dynamicConnection.query(`select id from blood_donor where hospital_id = ? and  hos_blood_donor_id = ?`, [
        createDonorDetail.hospital_id,
        id
      ])
      const dynBloodDonorID = dynBloodDonor.id;

      const dynBloodBankProducts = await this.dynamicConnection.query('SELECT id FROM blood_bank_products WHERE hospital_blood_bank_products_id = ? and Hospital_id=?', [createDonorDetail.blood_bank_product_id, createDonorDetail.hospital_id]);
      const dynBloodBankProductsID = dynBloodBankProducts[0].id;
      await this.dynamicConnection.query(`update blood_donor SET
    donor_name=?,
    date_of_birth=?,
    blood_bank_product_id=?,
    gender=?,
    father_name=?,
    address=?,
    contact_no=?,
    hospital_id=?
    where id=?`,
        [
          createDonorDetail.donor_name,
          createDonorDetail.date_of_birth,
          dynBloodBankProductsID,
          createDonorDetail.gender,
          createDonorDetail.father_name,
          createDonorDetail.address,
          createDonorDetail.contact_no,
          createDonorDetail.hospital_id,
          dynBloodDonorID
        ],
      )
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege": process.env.BLOOD_DONAR_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM blood_donor WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createBloodDonorCycle(createDonorDetail: DonorDetail) {
    try {
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');

      const [staffId] = await this.connection.query(
        'SELECT email FROM staff WHERE id = ?',
        [createDonorDetail.received_by],
      );
      if (!staffId || staffId.length === 0) {
        throw new Error(
          `Staff with id: ${createDonorDetail.received_by} not found.`,
        );
      }
      const docemail = staffId.email;
      const addBloodDonorCycle = await this.connection.query(
        `INSERT into blood_donor_cycle(
    blood_donor_cycle_id,
    blood_donor_id,
    charge_id,
    donate_date,
    bag_no,
    lot,
    quantity,
    standard_charge,
    apply_charge,
    amount,
    institution,
    note,
    discount_percentage,
    tax_percentage,
    volume,
    unit,
    available
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          0,
          createDonorDetail.blood_donor_id,
          createDonorDetail.charge_id,
          createDonorDetail.donate_date,
          createDonorDetail.bag_no,
          createDonorDetail.lot,
          1,
          createDonorDetail.standard_charge,
          createDonorDetail.apply_charge,
          createDonorDetail.amount,
          createDonorDetail.institution,
          createDonorDetail.note,
          createDonorDetail.discount_percentage,
          createDonorDetail.tax_percentage,
          createDonorDetail.volume,
          createDonorDetail.unit,
          1,
        ],
      );
      let component_issue_transaction_id;
      const component_issue_transaction = await this.connection.query(
        `INSERT into transactions (
         type,
         section,
         blood_donor_cycle_id,
         payment_mode,
         amount,
         cheque_no,
         cheque_date,
         attachment,
         attachment_name,
         payment_date,
         note,
         received_by
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Blood Bank',
          addBloodDonorCycle.insertId,
          createDonorDetail.payment_mode,
          createDonorDetail.amount,
          createDonorDetail.cheque_no,
          createDonorDetail.cheque_date,
          createDonorDetail.attachment,
          createDonorDetail.attachment_name,
          timestamp,
          createDonorDetail.note,
          createDonorDetail.received_by,
        ],
      );

      component_issue_transaction_id = component_issue_transaction.insertId;


      const addBloodDonorCycleID = addBloodDonorCycle.insertId;

      const dynamicUpdateStaff = await this.dynamicConnection.query(
        'SELECT id FROM staff WHERE email = ?',
        [docemail],
      );
      const dynamicUPTDStaffId = dynamicUpdateStaff[0].id;
      const dynBlooddonor = await this.dynamicConnection.query(
        'SELECT id FROM blood_donor WHERE hos_blood_donor_id = ? and hospital_id=?',
        [createDonorDetail.blood_donor_id, createDonorDetail.hospital_id],
      );
      const dynBlooddonorID = dynBlooddonor[0].id;
      const dynCharge = await this.dynamicConnection.query(
        'SELECT id FROM charges WHERE hospital_charges_id = ? and Hospital_id=?',
        [createDonorDetail.charge_id, createDonorDetail.hospital_id],
      );
      const dynChargeID = dynCharge[0].id;
      const addDynBloodDonorCycle = await this.dynamicConnection.query(
        `INSERT into blood_donor_cycle(
    blood_donor_cycle_id,
    blood_donor_id,
    charge_id,
    donate_date,
    bag_no,
    lot,
    quantity,
    standard_charge,
    apply_charge,
    amount,
    institution,
    note,
    discount_percentage,
    tax_percentage,
    volume,
    unit,
    available,
    hospital_id,
    hos_blood_donor_cycle_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          0,
          dynBlooddonorID,
          dynChargeID,
          createDonorDetail.donate_date,
          createDonorDetail.bag_no,
          createDonorDetail.lot,
          1,
          createDonorDetail.standard_charge,
          createDonorDetail.apply_charge,
          createDonorDetail.amount,
          createDonorDetail.institution,
          createDonorDetail.note,
          createDonorDetail.discount_percentage,
          createDonorDetail.tax_percentage,
          createDonorDetail.volume,
          createDonorDetail.unit,
          1,
          createDonorDetail.hospital_id,
          addBloodDonorCycleID,
        ],
      );

      await this.dynamicConnection.query(
        `INSERT into transactions (
         type,
         section,
         blood_donor_cycle_id,
         payment_mode,
         amount,
         cheque_no,
         cheque_date,
         attachment,
         attachment_name,
         payment_date,
         note,
         received_by,
         Hospital_id,
         hos_transaction_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          'payment',
          'Blood Bank',
          addDynBloodDonorCycle.insertId,
          createDonorDetail.payment_mode,
          createDonorDetail.amount,
          createDonorDetail.cheque_no,
          createDonorDetail.cheque_date,
          createDonorDetail.attachment,
          createDonorDetail.attachment_name,
          timestamp,
          createDonorDetail.note,
          dynamicUPTDStaffId,
          createDonorDetail.hospital_id,
          component_issue_transaction_id,
        ],
      );
      return [
        {
          'data ': {
            status: process.env.SUCCESS_STATUS_V2,
            messege: process.env.BLOOD_DONOR_CYCLE,
            Donor_Cycle_Details_Values: await this.connection.query(
              'SELECT * FROM blood_donor_cycle WHERE id = ?',
              [addBloodDonorCycleID],
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

  async removeBloodDonorCycle(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM blood_donor_cycle WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM blood_donor_cycle WHERE hos_blood_donor_cycle_id = ? and hospital_id = ?', [id, hospital_id]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.BLOOD_DONOR_ID} ${id} ${process.env.VISITOR_ASSOCIAT}`,
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



  async removeDonorandDonorCycle(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM blood_donor WHERE id = ?', [id]);
      await this.connection.query('DELETE FROM blood_donor_cycle WHERE blood_donor_id = ?', [id]);
      const [dynBloodDonor] = await this.dynamicConnection.query(`select id from blood_donor where hospital_id = ? and  hos_blood_donor_id = ?`, [
        hospital_id,
        id
      ])
      const dynBloodDonorID = dynBloodDonor.id;
      await this.dynamicConnection.query('DELETE FROM blood_donor WHERE id=?', [dynBloodDonorID]);
      await this.dynamicConnection.query('DELETE FROM blood_donor_cycle WHERE blood_donor_id = ?', [dynBloodDonorID]);
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.BLOOD} ${id} ${process.env.VISITOR_ASSOCIAT}`,
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




  async createComponents(createDonorDetail: DonorDetail[]) {

    try {
      let result;
      const results = [];

      for (const create_Donor_Detail_Entity of createDonorDetail) {
        result = await this.connection.query(
          'INSERT into blood_donor_cycle (blood_donor_cycle_id,blood_bank_product_id,bag_no,lot,quantity,institution,volume,unit,available) VALUES (?,?,?,?,?,?,?,?,?)',
          [
            create_Donor_Detail_Entity.blood_donor_cycle_id,
            create_Donor_Detail_Entity.blood_bank_product_id,
            create_Donor_Detail_Entity.bag_no,
            create_Donor_Detail_Entity.lot,
            create_Donor_Detail_Entity.quantity,
            create_Donor_Detail_Entity.institution,
            create_Donor_Detail_Entity.volume,
            create_Donor_Detail_Entity.unit,
            1,
          ],
        );
        await this.connection.query(
          `update blood_donor_cycle set available = 0 where id = ?`,
          [create_Donor_Detail_Entity.blood_donor_cycle_id],
        );
        const dynBloodBankProducts = await this.dynamicConnection.query(
          'SELECT id FROM blood_bank_products WHERE hospital_blood_bank_products_id = ? and Hospital_id=?',
          [
            create_Donor_Detail_Entity.blood_bank_product_id,
            create_Donor_Detail_Entity.hospital_id,
          ],
        );
        const dynBloodBankProductsID = dynBloodBankProducts[0].id;

        const [dyn_var] = await this.dynamicConnection.query(
          `select id from blood_donor_cycle where hospital_id = ? and hos_blood_donor_cycle_id = ?`,
          [
            create_Donor_Detail_Entity.hospital_id,
            create_Donor_Detail_Entity.blood_donor_cycle_id,
          ],
        );

        await this.dynamicConnection.query(
          'INSERT into blood_donor_cycle (blood_donor_cycle_id,blood_bank_product_id,bag_no,lot,quantity,institution,volume,unit,available,hospital_id,hos_blood_donor_cycle_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          [
            dyn_var.id,
            dynBloodBankProductsID,
            create_Donor_Detail_Entity.bag_no,
            create_Donor_Detail_Entity.lot,
            create_Donor_Detail_Entity.quantity,
            create_Donor_Detail_Entity.institution,
            create_Donor_Detail_Entity.volume,
            create_Donor_Detail_Entity.unit,
            create_Donor_Detail_Entity.available,
            create_Donor_Detail_Entity.hospital_id,
            result.insertId,
          ],
        );

        await this.dynamicConnection.query(
          `update blood_donor_cycle set available = 0 where id = ?`,
          [dyn_var.id],
        );

        const componentsDetail = await this.connection.query(
          'SELECT * FROM blood_donor_cycle where id = ?',
          [result.insertId],
        );

        results.push({
          status: process.env.SUCCESS_STATUS_V2,
          message: process.env.COMPONENTS,
          ComponentDetail: componentsDetail[0],
          originalInsertId: result.insertId,
        });
      }

      return {
        status: process.env.SUCCESS_STATUS_V2,
        message: process.env.COMPONENTS,
        data: results,
      };
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}