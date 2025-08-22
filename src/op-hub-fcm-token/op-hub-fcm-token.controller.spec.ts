import { Test, TestingModule } from '@nestjs/testing';
import { OpHubFcmTokenController } from './op-hub-fcm-token.controller';
import { OpHubFcmTokenService } from './op-hub-fcm-token.service';

describe('OpHubFcmTokenController', () => {
  let controller: OpHubFcmTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubFcmTokenController],
      providers: [OpHubFcmTokenService],
    }).compile();

    controller = module.get<OpHubFcmTokenController>(OpHubFcmTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
