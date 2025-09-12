import { Test, TestingModule } from '@nestjs/testing';
import { OpHubPrescriptionController } from './op-hub-prescription.controller';
import { OpHubPrescriptionService } from './op-hub-prescription.service';

describe('OpHubPrescriptionController', () => {
  let controller: OpHubPrescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubPrescriptionController],
      providers: [OpHubPrescriptionService],
    }).compile();

    controller = module.get<OpHubPrescriptionController>(OpHubPrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
