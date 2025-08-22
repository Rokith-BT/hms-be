import { Module } from '@nestjs/common';
import { FrontCmsMenuService } from './front_cms_menu.service';
import { FrontCmsMenuController } from './front_cms_menu.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [FrontCmsMenuController],
  providers: [FrontCmsMenuService, DynamicDatabaseService],
})
export class FrontCmsMenuModule { }
