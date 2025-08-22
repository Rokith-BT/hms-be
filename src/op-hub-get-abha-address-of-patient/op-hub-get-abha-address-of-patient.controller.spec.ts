import { Test, TestingModule } from '@nestjs/testing';
import { OpHubGetAbhaAddressOfPatientController } from './op-hub-get-abha-address-of-patient.controller';
import { OpHubGetAbhaAddressOfPatientService } from './op-hub-get-abha-address-of-patient.service';

describe('OpHubGetAbhaAddressOfPatientController', () => {
  let controller: OpHubGetAbhaAddressOfPatientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubGetAbhaAddressOfPatientController],
      providers: [OpHubGetAbhaAddressOfPatientService],
    }).compile();

    controller = module.get<OpHubGetAbhaAddressOfPatientController>(OpHubGetAbhaAddressOfPatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
