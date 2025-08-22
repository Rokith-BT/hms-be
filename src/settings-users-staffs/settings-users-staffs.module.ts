import { Module } from '@nestjs/common';
import { SettingsUsersStaffsService } from './settings-users-staffs.service';
import { SettingsUsersStaffsController } from './settings-users-staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsUsersStaff } from './entities/settings-users-staff.entity';

@Module({

  imports:[ TypeOrmModule.forFeature([SettingsUsersStaff])],

  controllers: [SettingsUsersStaffsController],
  providers: [SettingsUsersStaffsService],
})
export class SettingsUsersStaffsModule {}
