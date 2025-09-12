import { Test, TestingModule } from '@nestjs/testing';
import { OpHubAppointmentStatusService } from './op-hub-appointment-status.service';

describe('OpHubAppointmentStatusService', () => {
  let service: OpHubAppointmentStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubAppointmentStatusService],
    }).compile();

    service = module.get<OpHubAppointmentStatusService>(OpHubAppointmentStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
