import { Test, TestingModule } from '@nestjs/testing';
import { OpHubOpdPrescriptionService } from './op-hub-opd-prescription.service';

describe('OpHubOpdPrescriptionService', () => {
  let service: OpHubOpdPrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubOpdPrescriptionService],
    }).compile();

    service = module.get<OpHubOpdPrescriptionService>(OpHubOpdPrescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
