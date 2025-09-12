import { Test, TestingModule } from '@nestjs/testing';
import { OpHubDoctorSlotShiftServiceService } from './op-hub-doctor-slot-shift-service.service';

describe('OpHubDoctorSlotShiftServiceService', () => {
  let service: OpHubDoctorSlotShiftServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubDoctorSlotShiftServiceService],
    }).compile();

    service = module.get<OpHubDoctorSlotShiftServiceService>(OpHubDoctorSlotShiftServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
