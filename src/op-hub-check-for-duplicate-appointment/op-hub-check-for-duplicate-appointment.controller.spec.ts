import { Test, TestingModule } from '@nestjs/testing';
import { OpHubCheckForDuplicateAppointmentController } from './op-hub-check-for-duplicate-appointment.controller';
import { OpHubCheckForDuplicateAppointmentService } from './op-hub-check-for-duplicate-appointment.service';

describe('OpHubCheckForDuplicateAppointmentController', () => {
  let controller: OpHubCheckForDuplicateAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubCheckForDuplicateAppointmentController],
      providers: [OpHubCheckForDuplicateAppointmentService],
    }).compile();

    controller = module.get<OpHubCheckForDuplicateAppointmentController>(OpHubCheckForDuplicateAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
