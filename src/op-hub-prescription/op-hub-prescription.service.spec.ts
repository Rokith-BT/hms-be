import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPrescriptionService } from './op-hub-prescription.service';

describe('OpHubPrescriptionService', () => {
  let service: OpHubPrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubPrescriptionService],
    }).compile();

    service = module.get<OpHubPrescriptionService>(OpHubPrescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
