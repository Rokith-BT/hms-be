import { Test, TestingModule } from '@nestjs/testing';
import { PhrConsultationProcessController } from './phr-consultation-process.controller';
import { PhrConsultationProcessService } from './phr-consultation-process.service';

describe('PhrConsultationProcessController', () => {
  let controller: PhrConsultationProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhrConsultationProcessController],
      providers: [PhrConsultationProcessService],
    }).compile();

    controller = module.get<PhrConsultationProcessController>(PhrConsultationProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
