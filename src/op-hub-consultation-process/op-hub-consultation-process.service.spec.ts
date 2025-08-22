import { Test, TestingModule } from '@nestjs/testing';
import { OpHubConsultationProcessService } from './op-hub-consultation-process.service';

describe('OpHubConsultationProcessService', () => {
  let service: OpHubConsultationProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubConsultationProcessService],
    }).compile();

    service = module.get<OpHubConsultationProcessService>(OpHubConsultationProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
