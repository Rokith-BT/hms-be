import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingLanguagesService } from './setting-languages.service';
import { SettingLanguage } from './entities/setting-language.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setting-languages')
export class SettingLanguagesController {
  constructor(private readonly settingLanguagesService: SettingLanguagesService) {}
  @UseGuards(AuthGuard)

  @Post()
  create(@Body() setting_languageEntity:SettingLanguage) {
    return this.settingLanguagesService.create(setting_languageEntity);
  }

    @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.settingLanguagesService.findall();
  }


  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() setting_languageEntity:SettingLanguage) {
    return this.settingLanguagesService.update(id, setting_languageEntity);
  }


  
}
