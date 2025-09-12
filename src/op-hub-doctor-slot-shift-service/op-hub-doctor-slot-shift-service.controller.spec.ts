import { Test, TestingModule } from '@nestjs/testing';
import { OpHubDoctorSlotShiftServiceController } from './op-hub-doctor-slot-shift-service.controller';
import { OpHubDoctorSlotShiftServiceService } from './op-hub-doctor-slot-shift-service.service';

describe('OpHubDoctorSlotShiftServiceController', () => {
  let controller: OpHubDoctorSlotShiftServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubDoctorSlotShiftServiceController],
      providers: [OpHubDoctorSlotShiftServiceService],
    }).compile();

    controller = module.get<OpHubDoctorSlotShiftServiceController>(OpHubDoctorSlotShiftServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
