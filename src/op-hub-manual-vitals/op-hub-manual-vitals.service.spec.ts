import { Test, TestingModule } from '@nestjs/testing';
import { OpHubManualVitalsService } from './op-hub-manual-vitals.service';

describe('OpHubManualVitalsService', () => {
  let service: OpHubManualVitalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubManualVitalsService],
    }).compile();

    service = module.get<OpHubManualVitalsService>(OpHubManualVitalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
