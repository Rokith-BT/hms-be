import { Test, TestingModule } from '@nestjs/testing';
import { PhrHospitalsService } from './phr-hospitals.service';

describe('PhrHospitalsService', () => {
  let service: PhrHospitalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhrHospitalsService],
    }).compile();

    service = module.get<PhrHospitalsService>(PhrHospitalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
