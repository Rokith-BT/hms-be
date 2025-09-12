import { Module } from '@nestjs/common';
import { FrontCmsEventGalleryNewsService } from './front_cms_event_gallery_news.service';
import { FrontCmsEventGalleryNewsController } from './front_cms_event_gallery_news.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [FrontCmsEventGalleryNewsController],
  providers: [FrontCmsEventGalleryNewsService, DynamicDatabaseService],
})
export class FrontCmsEventGalleryNewsModule { }
