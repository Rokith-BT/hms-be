import { Test, TestingModule } from '@nestjs/testing';
import { OpHubGetPatientDetailsByAayushUniqueIdService } from './op-hub-get-patient-details-by-aayush-unique-id.service';

describe('OpHubGetPatientDetailsByAayushUniqueIdService', () => {
  let service: OpHubGetPatientDetailsByAayushUniqueIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubGetPatientDetailsByAayushUniqueIdService],
    }).compile();

    service = module.get<OpHubGetPatientDetailsByAayushUniqueIdService>(OpHubGetPatientDetailsByAayushUniqueIdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
