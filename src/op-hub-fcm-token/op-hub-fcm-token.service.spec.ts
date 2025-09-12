import { Test, TestingModule } from '@nestjs/testing';
import { OpHubFcmTokenService } from './op-hub-fcm-token.service';

describe('OpHubFcmTokenService', () => {
  let service: OpHubFcmTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubFcmTokenService],
    }).compile();

    service = module.get<OpHubFcmTokenService>(OpHubFcmTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
