import { Test, TestingModule } from '@nestjs/testing';
import { OpHubVitalsService } from './op-hub-vitals.service';

describe('OpHubVitalsService', () => {
  let service: OpHubVitalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubVitalsService],
    }).compile();

    service = module.get<OpHubVitalsService>(OpHubVitalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
