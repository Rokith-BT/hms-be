import { Test, TestingModule } from '@nestjs/testing';
import { OpHubEmrController } from './op-hub-emr.controller';
import { OpHubEmrService } from './op-hub-emr.service';

describe('OpHubEmrController', () => {
  let controller: OpHubEmrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubEmrController],
      providers: [OpHubEmrService],
    }).compile();

    controller = module.get<OpHubEmrController>(OpHubEmrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
