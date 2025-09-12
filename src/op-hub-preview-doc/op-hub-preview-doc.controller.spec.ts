import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPreviewDocController } from './op-hub-preview-doc.controller';
import { OpHubPreviewDocService } from './op-hub-preview-doc.service';

describe('OpHubPreviewDocController', () => {
  let controller: OpHubPreviewDocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubPreviewDocController],
      providers: [OpHubPreviewDocService],
    }).compile();

    controller = module.get<OpHubPreviewDocController>(OpHubPreviewDocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
