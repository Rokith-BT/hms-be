import { Module } from '@nestjs/common';
import { FrontCmsPageService } from './front_cms_page.service';
import { FrontCmsPageController } from './front_cms_page.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [FrontCmsPageController],
  providers: [FrontCmsPageService, DynamicDatabaseService],
})
export class FrontCmsPageModule { }
