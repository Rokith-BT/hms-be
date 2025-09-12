import { Test, TestingModule } from '@nestjs/testing';
import { OpHubUnlinkAbhaFromPatientController } from './op-hub-unlink-abha-from-patient.controller';
import { OpHubUnlinkAbhaFromPatientService } from './op-hub-unlink-abha-from-patient.service';

describe('OpHubUnlinkAbhaFromPatientController', () => {
  let controller: OpHubUnlinkAbhaFromPatientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubUnlinkAbhaFromPatientController],
      providers: [OpHubUnlinkAbhaFromPatientService],
    }).compile();

    controller = module.get<OpHubUnlinkAbhaFromPatientController>(OpHubUnlinkAbhaFromPatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
