import { Test, TestingModule } from '@nestjs/testing';
import { OpHubGetAbhaAddressOfPatientService } from './op-hub-get-abha-address-of-patient.service';

describe('OpHubGetAbhaAddressOfPatientService', () => {
  let service: OpHubGetAbhaAddressOfPatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubGetAbhaAddressOfPatientService],
    }).compile();

    service = module.get<OpHubGetAbhaAddressOfPatientService>(OpHubGetAbhaAddressOfPatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
