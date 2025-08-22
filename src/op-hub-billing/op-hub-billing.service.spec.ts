import { Test, TestingModule } from '@nestjs/testing';
import { OpHubBillingService } from './op-hub-billing.service';

describe('OpHubBillingService', () => {
  let service: OpHubBillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubBillingService],
    }).compile();

    service = module.get<OpHubBillingService>(OpHubBillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
