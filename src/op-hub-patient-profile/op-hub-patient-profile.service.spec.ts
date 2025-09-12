import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientProfileService } from './op-hub-patient-profile.service';

describe('OpHubPatientProfileService', () => {
  let service: OpHubPatientProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubPatientProfileService],
    }).compile();

    service = module.get<OpHubPatientProfileService>(OpHubPatientProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
