import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RevertDischargePatientOpdModule } from "./entities/revert_discharge_patient_opd_module.entity";

@Injectable()
export class RevertDischargePatientOpdModuleService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async update(id: number, RevertDischargePatientOpd: RevertDischargePatientOpdModule) {
    try {
      await this.connection.query(`
  UPDATE opd_details 
  SET discharged = 'no'
  WHERE id = ?`,
        [id]
      );
      const revertdischargecard = await this.connection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [id])
      const revertdissopdidd = revertdischargecard[0].id;
      await this.connection.query(`
  DELETE FROM discharge_card WHERE id = ?`,
        [revertdissopdidd]
      );
      //-------------------------------------//
      const getdynipdid = await this.dynamicConnection.query(`SELECT id from opd_details WHERE hos_opd_id = ? and Hospital_id = ?`, [id, RevertDischargePatientOpd.Hospital_id])
      const dynopdidd = getdynipdid[0].id;
      await this.dynamicConnection.query(`
  UPDATE opd_details 
  SET discharged = 'no'
  WHERE id = ?`,
        [dynopdidd]
      );
      const revertdynnnndischargecard = await this.dynamicConnection.query(`SELECT id from discharge_card WHERE opd_details_id = ?`, [dynopdidd])
      const revertdynnndissopdidd = revertdynnnndischargecard[0].id;
      await this.dynamicConnection.query(`
  DELETE FROM discharge_card WHERE id = ?`,
        [revertdynnndissopdidd]
      );
      return [
        {
          status: process.env.SUCCESS_STATUS_V2,
          message: `${process.env.OPD_DETAILS} ${id} ${process.env.OPD_ASSOCIATED}`,
        },
      ];
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
}
