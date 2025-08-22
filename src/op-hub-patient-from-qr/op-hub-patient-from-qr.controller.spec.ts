import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientFromQrController } from './op-hub-patient-from-qr.controller';
import { OpHubPatientFromQrService } from './op-hub-patient-from-qr.service';

describe('OpHubPatientFromQrController', () => {
  let controller: OpHubPatientFromQrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubPatientFromQrController],
      providers: [OpHubPatientFromQrService],
    }).compile();

    controller = module.get<OpHubPatientFromQrController>(OpHubPatientFromQrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
