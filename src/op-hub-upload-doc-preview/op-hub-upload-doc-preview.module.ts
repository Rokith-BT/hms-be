import { Module } from '@nestjs/common';
import { OpHubUploadDocPreviewService } from './op-hub-upload-doc-preview.service';
import { OpHubUploadDocPreviewController } from './op-hub-upload-doc-preview.controller';
import { OpHubPreviewDocService } from 'src/op-hub-preview-doc/op-hub-preview-doc.service';

@Module({
  controllers: [OpHubUploadDocPreviewController],
  providers: [OpHubUploadDocPreviewService,OpHubPreviewDocService],
})
export class OpHubUploadDocPreviewModule {}
