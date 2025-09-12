import { Test, TestingModule } from '@nestjs/testing';
import { OpHubAppointmentStatusController } from './op-hub-appointment-status.controller';
import { OpHubAppointmentStatusService } from './op-hub-appointment-status.service';

describe('OpHubAppointmentStatusController', () => {
  let controller: OpHubAppointmentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubAppointmentStatusController],
      providers: [OpHubAppointmentStatusService],
    }).compile();

    controller = module.get<OpHubAppointmentStatusController>(OpHubAppointmentStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
