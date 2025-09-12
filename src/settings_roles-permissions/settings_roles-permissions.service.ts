import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { SettingsRolesPermission } from "./entities/settings_roles-permission.entity";

@Injectable()
export class SettingsRolesPermissionsService {
  constructor(
    private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async findAll() {
    try {
         const roles = await this.connection.query(
      `select roles.id, roles.name,roles.is_active,roles.is_system from roles`,
    );
    return roles;
    } catch (error) {
       throw new HttpException({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: process.env.ERROR_MESSAGE,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
 
  }

  async findone(id: string) {
    try {
       const roles = await this.connection.query(
      `select roles.id, roles.name,roles.is_active,roles.is_system from roles where id = ?`,
      [id],
    );

    if (roles.length === 1) {
      return roles;
    } else {
      return null;
    }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: process.env.ERROR_MESSAGE,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
   
  }

  async update(id: string, rolesEntity: SettingsRolesPermission) {
    try {
      await this.connection.query(
        'update roles SET is_active = ? where id =?',
        [rolesEntity.is_active, id],
      );
      await this.dynamicConnection.query(
        `update roles SET is_active = ? where id = ?`,

        [rolesEntity.is_active, id],
      );
      return [
        {
          data: {
            status: process.env.SUCCESS_STATUS_V2,
            message: process.env.ROLES_UPDATED,
            updated_values: await this.connection.query(
              `select * from roles where id = ?`,
              [id],
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
}
