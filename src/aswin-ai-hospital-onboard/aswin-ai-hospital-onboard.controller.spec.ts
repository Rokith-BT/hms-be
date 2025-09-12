import { Test, TestingModule } from '@nestjs/testing';
import { AswinAiHospitalOnboardController } from './aswin-ai-hospital-onboard.controller';
import { AswinAiHospitalOnboardService } from './aswin-ai-hospital-onboard.service';

describe('AswinAiHospitalOnboardController', () => {
  let controller: AswinAiHospitalOnboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AswinAiHospitalOnboardController],
      providers: [AswinAiHospitalOnboardService],
    }).compile();

    controller = module.get<AswinAiHospitalOnboardController>(AswinAiHospitalOnboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
