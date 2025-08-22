import { Module } from '@nestjs/common';
import { SettingPrefixSettingService } from './setting-prefix_setting.service';
import { SettingPrefixSettingController } from './setting-prefix_setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingPrefixSetting } from './entities/setting-prefix_setting.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingPrefixSetting])],

  controllers: [SettingPrefixSettingController],
  providers: [SettingPrefixSettingService],
})
export class SettingPrefixSettingModule {}
