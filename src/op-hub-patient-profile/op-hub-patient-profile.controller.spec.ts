import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientProfileController } from './op-hub-patient-profile.controller';
import { OpHubPatientProfileService } from './op-hub-patient-profile.service';

describe('OpHubPatientProfileController', () => {
  let controller: OpHubPatientProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubPatientProfileController],
      providers: [OpHubPatientProfileService],
    }).compile();

    controller = module.get<OpHubPatientProfileController>(OpHubPatientProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
