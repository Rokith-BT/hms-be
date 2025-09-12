import { Test, TestingModule } from '@nestjs/testing';
import { OpHubAppointmentService } from './op-hub-appointment.service';

describe('OpHubAppointmentService', () => {
  let service: OpHubAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubAppointmentService],
    }).compile();

    service = module.get<OpHubAppointmentService>(OpHubAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
