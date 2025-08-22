import { Test, TestingModule } from '@nestjs/testing';
import { OpHubOverallHeaderSerachService } from './op-hub-overall-header-serach.service';

describe('OpHubOverallHeaderSerachService', () => {
  let service: OpHubOverallHeaderSerachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubOverallHeaderSerachService],
    }).compile();

    service = module.get<OpHubOverallHeaderSerachService>(OpHubOverallHeaderSerachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
