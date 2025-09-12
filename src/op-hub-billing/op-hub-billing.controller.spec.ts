import { Test, TestingModule } from '@nestjs/testing';
import { OpHubBillingController } from './op-hub-billing.controller';
import { OpHubBillingService } from './op-hub-billing.service';

describe('OpHubBillingController', () => {
  let controller: OpHubBillingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubBillingController],
      providers: [OpHubBillingService],
    }).compile();

    controller = module.get<OpHubBillingController>(OpHubBillingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
