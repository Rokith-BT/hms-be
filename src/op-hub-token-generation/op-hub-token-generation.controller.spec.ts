import { Test, TestingModule } from '@nestjs/testing';
import { OpHubTokenGenerationController } from './op-hub-token-generation.controller';
import { OpHubTokenGenerationService } from './op-hub-token-generation.service';

describe('OpHubTokenGenerationController', () => {
  let controller: OpHubTokenGenerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubTokenGenerationController],
      providers: [OpHubTokenGenerationService],
    }).compile();

    controller = module.get<OpHubTokenGenerationController>(OpHubTokenGenerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
