import { Module } from '@nestjs/common';
import { OpHubPreviewDocService } from './op-hub-preview-doc.service';
import { OpHubPreviewDocController } from './op-hub-preview-doc.controller';

@Module({
  controllers: [OpHubPreviewDocController],
  providers: [OpHubPreviewDocService],
})
export class OpHubPreviewDocModule {}
