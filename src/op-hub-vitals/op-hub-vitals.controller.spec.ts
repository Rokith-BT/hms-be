import { Test, TestingModule } from '@nestjs/testing';
import { OpHubVitalsController } from './op-hub-vitals.controller';
import { OpHubVitalsService } from './op-hub-vitals.service';

describe('OpHubVitalsController', () => {
  let controller: OpHubVitalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubVitalsController],
      providers: [OpHubVitalsService],
    }).compile();

    controller = module.get<OpHubVitalsController>(OpHubVitalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
