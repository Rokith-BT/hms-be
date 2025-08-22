import { Test, TestingModule } from '@nestjs/testing';
import { PhrAppointmentStatusController } from './phr-appointment-status.controller';
import { PhrAppointmentStatusService } from './phr-appointment-status.service';

describe('PhrAppointmentStatusController', () => {
  let controller: PhrAppointmentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhrAppointmentStatusController],
      providers: [PhrAppointmentStatusService],
    }).compile();

    controller = module.get<PhrAppointmentStatusController>(PhrAppointmentStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
