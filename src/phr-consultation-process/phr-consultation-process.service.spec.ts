import { Test, TestingModule } from '@nestjs/testing';
import { PhrConsultationProcessService } from './phr-consultation-process.service';

describe('PhrConsultationProcessService', () => {
  let service: PhrConsultationProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhrConsultationProcessService],
    }).compile();

    service = module.get<PhrConsultationProcessService>(PhrConsultationProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
