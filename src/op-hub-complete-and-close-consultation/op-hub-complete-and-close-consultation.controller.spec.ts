import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCompleteAndCloseConsultationController } from './op-hub-complete-and-close-consultation.controller';
import { OpHubCompleteAndCloseConsultationService } from './op-hub-complete-and-close-consultation.service';

describe('OpHubCompleteAndCloseConsultationController', () => {
  let controller: OpHubCompleteAndCloseConsultationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubCompleteAndCloseConsultationController],
      providers: [OpHubCompleteAndCloseConsultationService],
    }).compile();

    controller = module.get<OpHubCompleteAndCloseConsultationController>(OpHubCompleteAndCloseConsultationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
