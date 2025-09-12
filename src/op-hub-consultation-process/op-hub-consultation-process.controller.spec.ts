import { Test, TestingModule } from '@nestjs/testing';
import { OpHubConsultationProcessController } from './op-hub-consultation-process.controller';
import { OpHubConsultationProcessService } from './op-hub-consultation-process.service';

describe('OpHubConsultationProcessController', () => {
  let controller: OpHubConsultationProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubConsultationProcessController],
      providers: [OpHubConsultationProcessService],
    }).compile();

    controller = module.get<OpHubConsultationProcessController>(OpHubConsultationProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
