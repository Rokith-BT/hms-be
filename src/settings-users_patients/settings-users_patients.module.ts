import { Module } from '@nestjs/common';
import { SettingsUsersPatientsService } from './settings-users_patients.service';
import { SettingsUsersPatientsController } from './settings-users_patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsUsersPatient } from './entities/settings-users_patient.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingsUsersPatient])],

  controllers: [SettingsUsersPatientsController],
  providers: [SettingsUsersPatientsService],
})
export class SettingsUsersPatientsModule {}
