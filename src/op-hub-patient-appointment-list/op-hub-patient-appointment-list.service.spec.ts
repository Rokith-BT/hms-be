import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientAppointmentListService } from './op-hub-patient-appointment-list.service';

describe('OpHubPatientAppointmentListService', () => {
  let service: OpHubPatientAppointmentListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubPatientAppointmentListService],
    }).compile();

    service = module.get<OpHubPatientAppointmentListService>(OpHubPatientAppointmentListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
