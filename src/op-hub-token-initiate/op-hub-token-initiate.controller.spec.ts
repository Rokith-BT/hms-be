import { Test, TestingModule } from '@nestjs/testing';
import { OpHubTokenInitiateController } from './op-hub-token-initiate.controller';
import { OpHubTokenInitiateService } from './op-hub-token-initiate.service';

describe('OpHubTokenInitiateController', () => {
  let controller: OpHubTokenInitiateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubTokenInitiateController],
      providers: [OpHubTokenInitiateService],
    }).compile();

    controller = module.get<OpHubTokenInitiateController>(OpHubTokenInitiateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
