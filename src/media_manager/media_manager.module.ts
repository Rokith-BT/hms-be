import { Module } from '@nestjs/common';
import { MediaManagerService } from './media_manager.service';
import { MediaManagerController } from './media_manager.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [MediaManagerController],
  providers: [MediaManagerService,DynamicDatabaseService],
})
export class MediaManagerModule {}
