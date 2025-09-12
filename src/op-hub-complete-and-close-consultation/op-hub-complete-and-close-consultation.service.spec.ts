import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCompleteAndCloseConsultationService } from './op-hub-complete-and-close-consultation.service';

describe('OpHubCompleteAndCloseConsultationService', () => {
  let service: OpHubCompleteAndCloseConsultationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubCompleteAndCloseConsultationService],
    }).compile();

    service = module.get<OpHubCompleteAndCloseConsultationService>(OpHubCompleteAndCloseConsultationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
