import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPatientAppointmentListController } from './op-hub-patient-appointment-list.controller';
import { OpHubPatientAppointmentListService } from './op-hub-patient-appointment-list.service';

describe('OpHubPatientAppointmentListController', () => {
  let controller: OpHubPatientAppointmentListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubPatientAppointmentListController],
      providers: [OpHubPatientAppointmentListService],
    }).compile();

    controller = module.get<OpHubPatientAppointmentListController>(OpHubPatientAppointmentListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
