import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCheckOldPatientService } from './op-hub-check-old-patient.service';

describe('OpHubCheckOldPatientService', () => {
  let service: OpHubCheckOldPatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubCheckOldPatientService],
    }).compile();

    service = module.get<OpHubCheckOldPatientService>(OpHubCheckOldPatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
