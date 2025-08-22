import { Test, TestingModule } from '@nestjs/testing';
import { OpHubManualVitalsController } from './op-hub-manual-vitals.controller';
import { OpHubManualVitalsService } from './op-hub-manual-vitals.service';

describe('OpHubManualVitalsController', () => {
  let controller: OpHubManualVitalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubManualVitalsController],
      providers: [OpHubManualVitalsService],
    }).compile();

    controller = module.get<OpHubManualVitalsController>(OpHubManualVitalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
