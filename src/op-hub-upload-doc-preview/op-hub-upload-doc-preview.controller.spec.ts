import { Test, TestingModule } from '@nestjs/testing';
import { OpHubUploadDocPreviewController } from './op-hub-upload-doc-preview.controller';
import { OpHubUploadDocPreviewService } from './op-hub-upload-doc-preview.service';

describe('OpHubUploadDocPreviewController', () => {
  let controller: OpHubUploadDocPreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubUploadDocPreviewController],
      providers: [OpHubUploadDocPreviewService],
    }).compile();

    controller = module.get<OpHubUploadDocPreviewController>(OpHubUploadDocPreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
