import { Test, TestingModule } from '@nestjs/testing';
import { OpHubSendNotificationService } from './op-hub-send-notification.service';

describe('OpHubSendNotificationService', () => {
  let service: OpHubSendNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubSendNotificationService],
    }).compile();

    service = module.get<OpHubSendNotificationService>(OpHubSendNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
