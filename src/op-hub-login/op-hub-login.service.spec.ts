import { Test, TestingModule } from '@nestjs/testing';
import { OpHubLoginService } from './op-hub-login.service';

describe('OpHubLoginService', () => {
  let service: OpHubLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubLoginService],
    }).compile();

    service = module.get<OpHubLoginService>(OpHubLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
