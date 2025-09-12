import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RevertDischargePatientIpdModule } from './entities/revert_discharge_patient_ipd_module.entity';

@Injectable()
export class RevertDischargePatientIpdModuleService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) {}
  async update(
    id: number,
    RevertDischargePatientIpd: RevertDischargePatientIpdModule,
  ) {
    try {
      await this.connection.query(
        `
  UPDATE ipd_details 
  SET discharged = 'no'
  WHERE id = ?`,
        [id],
      );
      const revertcaseeeid = await this.connection.query(
        `SELECT case_reference_id from ipd_details WHERE id = ?`,
        [id],
      );
      const revertcaseipdidd = revertcaseeeid[0].case_reference_id;
      const fromDate = new Date();
      const timestamp = fromDate
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '');
      const revertDischargeIpd = await this.connection.query(
        `INSERT into patient_bed_history(
  case_reference_id,
  bed_group_id,
  bed_id,
  revert_reason,
  from_date,
  is_active
) VALUES (?,?,?,?,?,?)`,
        [
          revertcaseipdidd,
          RevertDischargePatientIpd.bed_group_id,
          RevertDischargePatientIpd.bed_id,
          RevertDischargePatientIpd.revert_reason,
          timestamp,
          'yes',
        ],
      );
      const revertdispat = revertDischargeIpd.insertId;
      const revertbedid = await this.connection.query(
        `SELECT bed from ipd_details WHERE id = ?`,
        [id],
      );
      const revertbedipdidd = revertbedid[0].bed;
      await this.connection.query(
        `
  UPDATE bed 
  SET is_active = 'no'
  WHERE id = ?`,
        [revertbedipdidd],
      );
      const revertdischargecard = await this.connection.query(
        `SELECT id from discharge_card WHERE ipd_details_id = ?`,
        [id],
      );
      const revertdissipdidd = revertdischargecard[0].id;
      await this.connection.query(
        `
  DELETE FROM discharge_card WHERE id = ?`,
        [revertdissipdidd],
      );

      const getdynipdid = await this.dynamicConnection.query(
        `SELECT id from ipd_details WHERE hospital_ipd_details_id = ? and hospital_id = ?`,
        [id, RevertDischargePatientIpd.Hospital_id],
      );
      const dynipdidd = getdynipdid[0].id;
      await this.dynamicConnection.query(
        `
  UPDATE ipd_details 
  SET discharged = 'no'
  WHERE id = ?`,
        [dynipdidd],
      );
      const revertdyncaseeeid = await this.dynamicConnection.query(
        `SELECT case_reference_id from ipd_details WHERE id = ?`,
        [dynipdidd],
      );
      const revertdyncaseipdidd = revertdyncaseeeid[0].case_reference_id;
      const revertdynbedGroupid = await this.dynamicConnection.query(
        `SELECT id from bed_group WHERE hospital_bed_group_id = ? and Hospital_id = ?`,
        [
          RevertDischargePatientIpd.bed_group_id,
          RevertDischargePatientIpd.Hospital_id,
        ],
      );
      const revertdynbedgroupipdidd = revertdynbedGroupid[0].id;
      const revertdynbedid = await this.dynamicConnection.query(
        `SELECT id from bed WHERE hospital_bed_id = ? and Hospital_id = ?`,
        [
          RevertDischargePatientIpd.bed_id,
          RevertDischargePatientIpd.Hospital_id,
        ],
      );
      const revertdynbedipdidd = revertdynbedid[0].id;
      await this.dynamicConnection.query(
        `INSERT into patient_bed_history(
    case_reference_id,
    bed_group_id,
    bed_id,
    revert_reason,
    from_date,
    is_active,
    hospital_id,
    hospital_patient_bed_history_id
  ) VALUES (?,?,?,?,?,?,?,?)`,
        [
          revertdyncaseipdidd,
          revertdynbedgroupipdidd,
          revertdynbedipdidd,
          RevertDischargePatientIpd.revert_reason,
          timestamp,
          'yes',
          RevertDischargePatientIpd.Hospital_id,
          revertdispat,
        ],
      );

      const dynnnrevertbedid = await this.dynamicConnection.query(
        `SELECT bed from ipd_details WHERE id = ?`,
        [dynipdidd],
      );
      const revertdynnbedipdidd = dynnnrevertbedid[0].bed;

      await this.dynamicConnection.query(
        `
  UPDATE bed 
  SET is_active = 'no'
  WHERE id = ?`,
        [revertdynnbedipdidd],
      );
      const revertdynnnndischargecard = await this.dynamicConnection.query(
        `SELECT id from discharge_card WHERE ipd_details_id = ?`,
        [dynipdidd],
      );
      const revertdynnndissipdidd = revertdynnnndischargecard[0].id;

      await this.dynamicConnection.query(
        `
  DELETE FROM discharge_card WHERE id = ?`,
        [revertdynnndissipdidd],
      );
      return [
        {
          status: process.env.SUCCESS_STATUS,
          message: `${process.env.REVERT_IPD_RETURN_MESSAGE} ${id} ${process.env.REVERT_IPD_END_MESSAGE}`,
        },
      ];
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: process.env.VALIDATION_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
