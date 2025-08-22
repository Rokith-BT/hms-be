import { Test, TestingModule } from '@nestjs/testing';
import { OpHubOpdPrescriptionController } from './op-hub-opd-prescription.controller';
import { OpHubOpdPrescriptionService } from './op-hub-opd-prescription.service';

describe('OpHubOpdPrescriptionController', () => {
  let controller: OpHubOpdPrescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubOpdPrescriptionController],
      providers: [OpHubOpdPrescriptionService],
    }).compile();

    controller = module.get<OpHubOpdPrescriptionController>(OpHubOpdPrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
