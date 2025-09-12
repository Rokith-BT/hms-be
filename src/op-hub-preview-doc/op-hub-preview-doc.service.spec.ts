import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPreviewDocService } from './op-hub-preview-doc.service';

describe('OpHubPreviewDocService', () => {
  let service: OpHubPreviewDocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubPreviewDocService],
    }).compile();

    service = module.get<OpHubPreviewDocService>(OpHubPreviewDocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
