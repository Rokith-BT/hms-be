import { Test, TestingModule } from '@nestjs/testing';
import { OpHubUploadDocPreviewService } from './op-hub-upload-doc-preview.service';

describe('OpHubUploadDocPreviewService', () => {
  let service: OpHubUploadDocPreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubUploadDocPreviewService],
    }).compile();

    service = module.get<OpHubUploadDocPreviewService>(OpHubUploadDocPreviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
