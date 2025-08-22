import { Module } from '@nestjs/common';
import { SettingsEmailSettingsService } from './settings-email-settings.service';
import { SettingsEmailSettingsController } from './settings-email-settings.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsEmailSetting } from './entities/settings-email-setting.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingsEmailSetting])],

  controllers: [SettingsEmailSettingsController],
  providers: [SettingsEmailSettingsService,DynamicDatabaseService],
})
export class SettingsEmailSettingsModule {}
