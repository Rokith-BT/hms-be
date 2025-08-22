import { Test, TestingModule } from '@nestjs/testing';
import { OpHubTokenInitiateService } from './op-hub-token-initiate.service';

describe('OpHubTokenInitiateService', () => {
  let service: OpHubTokenInitiateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubTokenInitiateService],
    }).compile();

    service = module.get<OpHubTokenInitiateService>(OpHubTokenInitiateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
