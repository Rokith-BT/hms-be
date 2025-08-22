import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TpaManagement } from './entities/tpa_management.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TpaManagementService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(tpa_managementEntity: TpaManagement) {
    try {
      const result = await this.connection.query(
        `Insert into organisation (organisation_name,code,contact_no,address,contact_person_name,contact_person_phone) values (?,?,?,?,?,?)`,
        [tpa_managementEntity.organisation_name,
        tpa_managementEntity.code,
        tpa_managementEntity.contact_no,
        tpa_managementEntity.address,
        tpa_managementEntity.contact_person_name,
        tpa_managementEntity.contact_person_phone
        ]
      );
      const tpaid = result.insertId
      await this.dynamicConnection.query(`insert into organisation 
      (organisation_name,code,contact_no,address,contact_person_name,
        contact_person_phone,Hospital_id,hos_organisation_id) values (?,?,?,?,?,?,?,?)`, [
        tpa_managementEntity.organisation_name,
        tpa_managementEntity.code,
        tpa_managementEntity.contact_no,
        tpa_managementEntity.address,
        tpa_managementEntity.contact_person_name,
        tpa_managementEntity.contact_person_phone,
        tpa_managementEntity.Hospital_id,
        tpaid
      ])
      return [{
        "data ": {
          "id  ": tpaid,
          "status":process.env.SUCCESS_STATUS_V2,
          "messege": process.env.TPA_MANAGEMENT,
          "inserted_data": await this.connection.query('SELECT * FROM organisation WHERE id = ?', [tpaid])
        }
      }];
    } catch (error) {
    throw new HttpException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: process.env.ERROR_MESSAGE,
    }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findAll() {
    try {
        const TPA_management = await this.connection.query(`select organisation.id, organisation.organisation_name as name,organisation.code as code,organisation.contact_no as phone,organisation.address as Address,
  organisation.contact_person_name,organisation.contact_person_phone from organisation`);
    return TPA_management;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
  
  }

  async findone(id: string) {
    try {
      const TPA_management = await this.connection.query(`select organisation.id, organisation.organisation_name as name,organisation.code as code,organisation.contact_no as phone,organisation.address as Address,
organisation.contact_person_name,organisation.contact_person_phone from organisation where id = ? `, [id]);
    return TPA_management;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }

  async update(id: string, tpa_managementEntity: TpaManagement) {
    try {
       await this.connection.query(
        `UPDATE organisation SET organisation_name = ?, code = ?, contact_no = ?, address = ?, contact_person_name = ?, contact_person_phone = ? where id = ?`,
        [
          tpa_managementEntity.organisation_name,
          tpa_managementEntity.code,
          tpa_managementEntity.contact_no,
          tpa_managementEntity.address,
          tpa_managementEntity.contact_person_name,
          tpa_managementEntity.contact_person_phone,
          id
        ]
      );
      await this.dynamicConnection.query(
        `update organisation SET organisation_name = ?,code = ?, contact_no = ?, address = ?, contact_person_name = ?, contact_person_phone = ? 
      where Hospital_id = ? and hos_organisation_id = ? `, [
        tpa_managementEntity.organisation_name,
        tpa_managementEntity.code,
        tpa_managementEntity.contact_no,
        tpa_managementEntity.address,
        tpa_managementEntity.contact_person_name,
        tpa_managementEntity.contact_person_phone,
        tpa_managementEntity.Hospital_id,
        id
      ]
      );
      return [{
        "data": {
          status: process.env.SUCCESS_STATUS_V2,
          "message": process.env.TPA_MANAGEMENT_UPDATED,
          "updated_values": await this.connection.query(`select * from organisation where id = ?`, [id])

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

  async remove(id: string, hos_id: number) {
    try {
      await this.dynamicConnection.query(`update organisation set is_deleted = 1 where Hospital_id = ?
    and hos_organisation_id = ?`, [hos_id, id])
      await this.connection.query(`delete from organisation where id = ?`, [id]);

      return [{
        status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED
      }
      ]
    } catch (error) {
throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }
}
