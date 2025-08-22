import { Test, TestingModule } from '@nestjs/testing';
import { OpHubGetPatientDetailsByAayushUniqueIdController } from './op-hub-get-patient-details-by-aayush-unique-id.controller';
import { OpHubGetPatientDetailsByAayushUniqueIdService } from './op-hub-get-patient-details-by-aayush-unique-id.service';

describe('OpHubGetPatientDetailsByAayushUniqueIdController', () => {
  let controller: OpHubGetPatientDetailsByAayushUniqueIdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubGetPatientDetailsByAayushUniqueIdController],
      providers: [OpHubGetPatientDetailsByAayushUniqueIdService],
    }).compile();

    controller = module.get<OpHubGetPatientDetailsByAayushUniqueIdController>(OpHubGetPatientDetailsByAayushUniqueIdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
