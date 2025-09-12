import { Test, TestingModule } from '@nestjs/testing';
import { AswinAiHospitalOnboardService } from './aswin-ai-hospital-onboard.service';

describe('AswinAiHospitalOnboardService', () => {
  let service: AswinAiHospitalOnboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AswinAiHospitalOnboardService],
    }).compile();

    service = module.get<AswinAiHospitalOnboardService>(AswinAiHospitalOnboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
