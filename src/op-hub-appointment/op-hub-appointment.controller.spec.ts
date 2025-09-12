import { Test, TestingModule } from '@nestjs/testing';
import { OpHubAppointmentController } from './op-hub-appointment.controller';
import { OpHubAppointmentService } from './op-hub-appointment.service';

describe('OpHubAppointmentController', () => {
  let controller: OpHubAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubAppointmentController],
      providers: [OpHubAppointmentService],
    }).compile();

    controller = module.get<OpHubAppointmentController>(OpHubAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
