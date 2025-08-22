import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientFromQrService } from './op-hub-patient-from-qr.service';

describe('OpHubPatientFromQrService', () => {
  let service: OpHubPatientFromQrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubPatientFromQrService],
    }).compile();

    service = module.get<OpHubPatientFromQrService>(OpHubPatientFromQrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
