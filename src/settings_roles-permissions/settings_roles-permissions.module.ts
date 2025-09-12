import { Module } from '@nestjs/common';
import { SettingsRolesPermissionsService } from './settings_roles-permissions.service';
import { SettingsRolesPermissionsController } from './settings_roles-permissions.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsRolesPermission } from './entities/settings_roles-permission.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingsRolesPermission])],

  controllers: [SettingsRolesPermissionsController],
  providers: [SettingsRolesPermissionsService,DynamicDatabaseService],
})
export class SettingsRolesPermissionsModule {}
