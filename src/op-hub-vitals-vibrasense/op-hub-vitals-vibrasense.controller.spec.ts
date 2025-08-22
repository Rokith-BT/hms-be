import { Test, TestingModule } from '@nestjs/testing';
import { OpHubVitalsVibrasenseController } from './op-hub-vitals-vibrasense.controller';
import { OpHubVitalsVibrasenseService } from './op-hub-vitals-vibrasense.service';

describe('OpHubVitalsVibrasenseController', () => {
  let controller: OpHubVitalsVibrasenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubVitalsVibrasenseController],
      providers: [OpHubVitalsVibrasenseService],
    }).compile();

    controller = module.get<OpHubVitalsVibrasenseController>(OpHubVitalsVibrasenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
