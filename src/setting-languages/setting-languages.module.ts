import { Module } from '@nestjs/common';
import { SettingLanguagesService } from './setting-languages.service';
import { SettingLanguagesController } from './setting-languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingLanguage } from './entities/setting-language.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingLanguage])],

  controllers: [SettingLanguagesController],
  providers: [SettingLanguagesService,DynamicDatabaseService],
})
export class SettingLanguagesModule {}
