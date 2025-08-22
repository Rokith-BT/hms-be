import { Test, TestingModule } from '@nestjs/testing';
import { PhrAppointmentStatusService } from './phr-appointment-status.service';

describe('PhrAppointmentStatusService', () => {
  let service: PhrAppointmentStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhrAppointmentStatusService],
    }).compile();

    service = module.get<PhrAppointmentStatusService>(PhrAppointmentStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
