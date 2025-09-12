import { Test, TestingModule } from '@nestjs/testing';
import { OpHubUnlinkAbhaFromPatientService } from './op-hub-unlink-abha-from-patient.service';

describe('OpHubUnlinkAbhaFromPatientService', () => {
  let service: OpHubUnlinkAbhaFromPatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubUnlinkAbhaFromPatientService],
    }).compile();

    service = module.get<OpHubUnlinkAbhaFromPatientService>(OpHubUnlinkAbhaFromPatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
