import { Test, TestingModule } from '@nestjs/testing';
import { PhrAppointmentController } from './phr-appointment.controller';
import { PhrAppointmentService } from './phr-appointment.service';

describe('PhrAppointmentController', () => {
  let controller: PhrAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhrAppointmentController],
      providers: [PhrAppointmentService],
    }).compile();

    controller = module.get<PhrAppointmentController>(PhrAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
