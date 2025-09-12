import { Test, TestingModule } from '@nestjs/testing';
import { OpHubOverallHeaderSerachController } from './op-hub-overall-header-serach.controller';
import { OpHubOverallHeaderSerachService } from './op-hub-overall-header-serach.service';

describe('OpHubOverallHeaderSerachController', () => {
  let controller: OpHubOverallHeaderSerachController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubOverallHeaderSerachController],
      providers: [OpHubOverallHeaderSerachService],
    }).compile();

    controller = module.get<OpHubOverallHeaderSerachController>(OpHubOverallHeaderSerachController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
