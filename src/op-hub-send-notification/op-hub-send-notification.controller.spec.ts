import { Test, TestingModule } from '@nestjs/testing';
import { OpHubSendNotificationController } from './op-hub-send-notification.controller';
import { OpHubSendNotificationService } from './op-hub-send-notification.service';

describe('OpHubSendNotificationController', () => {
  let controller: OpHubSendNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubSendNotificationController],
      providers: [OpHubSendNotificationService],
    }).compile();

    controller = module.get<OpHubSendNotificationController>(OpHubSendNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
