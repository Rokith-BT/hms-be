import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingPrefixSetting } from './entities/setting-prefix_setting.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingPrefixSettingService {
  constructor(private readonly connection: DataSource) { }

  async create(prefix_setting_entity: SettingPrefixSetting) {
    try {

      const result = await this.connection.query(`insert into prefixes (type,prefix) values (?,?)`,
        [prefix_setting_entity.type,
        prefix_setting_entity.prefix]
      );

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.PREFIX_DETAILS,
          "inserted_data": await this.connection.query('SELECT * FROM prefixes WHERE id = ?', [result.insertId])
        }
      }];;

    } catch (error) {
        throw new HttpException({
             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
             message: process.env.ERROR_MESSAGE,
           }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findall() {
    try {
       const prefix_setting = await this.connection.query(`select prefixes.id,prefixes.type, prefixes.prefix from prefixes`);
    return prefix_setting;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async update(id: string, SettingPrefixSettingServiceEntity: SettingPrefixSetting) {
    try {
      await this.connection.query(
        `update prefixes SET prefix = ? where id = ?`,
        [
          SettingPrefixSettingServiceEntity.prefix,
          id
        ]
      )
      return [{
        "data ": {
        status:  process.env.SUCCESS_STATUS_V2,
          message: process.env.DELETED,
          "updated_values": await this.connection.query('SELECT * FROM prefixes WHERE id = ?', [id])
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

}
