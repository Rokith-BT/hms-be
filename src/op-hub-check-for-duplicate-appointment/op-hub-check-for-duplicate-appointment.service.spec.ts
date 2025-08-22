import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCheckForDuplicateAppointmentService } from './op-hub-check-for-duplicate-appointment.service';

describe('OpHubCheckForDuplicateAppointmentService', () => {
  let service: OpHubCheckForDuplicateAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubCheckForDuplicateAppointmentService],
    }).compile();

    service = module.get<OpHubCheckForDuplicateAppointmentService>(OpHubCheckForDuplicateAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
