import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCheckOldPatientController } from './op-hub-check-old-patient.controller';
import { OpHubCheckOldPatientService } from './op-hub-check-old-patient.service';

describe('OpHubCheckOldPatientController', () => {
  let controller: OpHubCheckOldPatientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubCheckOldPatientController],
      providers: [OpHubCheckOldPatientService],
    }).compile();

    controller = module.get<OpHubCheckOldPatientController>(OpHubCheckOldPatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
