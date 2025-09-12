import { Test, TestingModule } from '@nestjs/testing';
import { OpHubEmrService } from './op-hub-emr.service';

describe('OpHubEmrService', () => {
  let service: OpHubEmrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubEmrService],
    }).compile();

    service = module.get<OpHubEmrService>(OpHubEmrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
