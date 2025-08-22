import { Test, TestingModule } from '@nestjs/testing';
import { OpHubTokenGenerationService } from './op-hub-token-generation.service';

describe('OpHubTokenGenerationService', () => {
  let service: OpHubTokenGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubTokenGenerationService],
    }).compile();

    service = module.get<OpHubTokenGenerationService>(OpHubTokenGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
