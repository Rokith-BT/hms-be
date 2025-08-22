import { Test, TestingModule } from '@nestjs/testing';
import { PhrAppointmentService } from './phr-appointment.service';

describe('PhrAppointmentService', () => {
  let service: PhrAppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhrAppointmentService],
    }).compile();

    service = module.get<PhrAppointmentService>(PhrAppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
