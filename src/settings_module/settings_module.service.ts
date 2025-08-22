import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { SettingsModule } from "./entities/settings_module.entity"

@Injectable()
export class SettingsModuleService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createSettingsModuleDto: SettingsModule) {
    try {
      const AddPermisionGroup = await this.connection.query(`insert into permission_group (name,short_code) 
        values (?,?)`, [
        createSettingsModuleDto.name,
        createSettingsModuleDto.short_code
      ])
      await this.dynamicConnection.query(`insert into permission_group (name,
                short_code,
                hospital_id,
                hospital_permission_group_id
                ) 
        values (?,?,?,?)`, [
        createSettingsModuleDto.name,
        createSettingsModuleDto.short_code,
        createSettingsModuleDto.hospital_id,
        AddPermisionGroup.insertId
      ])
      return {
        "status": process.env.SUCCESS_STATUS_V2,
        "message": process.env.MODULE
      }
    } catch (error) {
 throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  async findAll() {
    try {
        const getAllModules = await this.connection.query(`select * from permission_group`)
    return getAllModules;
    } catch (error) {
        throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
      
  }

  findOne(id: number) {
    return `This action returns a #${id} settingsModule`;
  }

  async update(id: number, updateSettingsModuleDto: SettingsModule) {

    try {
      await this.connection.query(`update permission_group set is_active = ? where id = ?`, [
        updateSettingsModuleDto.is_active, id])
      const [getAdminId] = await this.dynamicConnection.query(`select id from permission_group where hospital_id = ? and hospital_permission_group_id = ?`, [
        updateSettingsModuleDto.hospital_id,
        id
      ])
      await this.dynamicConnection.query(`update permission_group set is_active = ? where id = ?`, [
        updateSettingsModuleDto.is_active,
        getAdminId.id])
      return {
        "status": process.env.SUCCESS_STATUS_V2,
        "message": process.env.MODULE_UPDATED
      }
    } catch (error) {
  throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);    }
  }

  remove(id: number) {
    return `This action removes a #${id} settingsModule`;
  }
}
