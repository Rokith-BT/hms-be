import { Module } from '@nestjs/common';
import { FrontCmsBannerService } from './front_cms_banner.service';
import { FrontCmsBannerController } from './front_cms_banner.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [FrontCmsBannerController],
  providers: [FrontCmsBannerService, DynamicDatabaseService],
})
export class FrontCmsBannerModule { }
