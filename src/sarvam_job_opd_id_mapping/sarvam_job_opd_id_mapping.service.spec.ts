import { Test, TestingModule } from '@nestjs/testing';
import { SarvamJobOpdIdMappingService } from './sarvam_job_opd_id_mapping.service';

describe('SarvamJobOpdIdMappingService', () => {
  let service: SarvamJobOpdIdMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SarvamJobOpdIdMappingService],
    }).compile();

    service = module.get<SarvamJobOpdIdMappingService>(SarvamJobOpdIdMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
