import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SettingLanguage } from './entities/setting-language.entity';
import { DataSource } from 'typeorm';
import { async } from 'rxjs';

@Injectable()
export class SettingLanguagesService {
  constructor(private readonly connection: DataSource) { }

  async create(setting_languageEntity: SettingLanguage) {
    try {
      const result = await this.connection.query('insert into languages (language,short_code,country_code) values (?,?,?)',
        [
          setting_languageEntity.language,
          setting_languageEntity.short_code,
          setting_languageEntity.country_code
        ]
      );

      return [{
        "data ": {
          "id  ": result.insertId,
          "status": process.env.SUCCESS_STATUS_V2,
          "messege": process.env.LANGUAGE,
          "inserted_data": await this.connection.query('SELECT * FROM languages WHERE id = ?', [result.insertId])
        }
      }];

    } catch (error) {
      throw new HttpException({
             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
             message: process.env.ERROR_MESSAGE,
           }, HttpStatus.INTERNAL_SERVER_ERROR);
             }
    }

  


  async findall() {
    try {
         const SettingLanguage = await this.connection.query(`select languages.id,languages.language,languages.short_code,languages.country_code,languages.is_deleted,
    languages.is_rtl,languages.is_active from languages `);
    return SettingLanguage;
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
 
  }

  async update(id: string, SettingLanguageEntity: SettingLanguage) {
    try {
      await this.connection.query(
        `update languages SET is_deleted = ?, is_rtl = ?,is_active = ? where id = ?`,
        [
          SettingLanguageEntity.is_deleted,
          SettingLanguageEntity.is_rtl,
          SettingLanguageEntity.is_active,
          id
        ]
      );
      return [{
        "data ": {
          status: process.env.SUCCESS_STATUS_V2,
          "messege":process.env.LANGUAGE_UPDATED,
          "updated_values": await this.connection.query('SELECT * FROM languages WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
