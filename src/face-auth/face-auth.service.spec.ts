import { Test, TestingModule } from '@nestjs/testing';
import { FaceAuthService } from './face-auth.service';

describe('FaceAuthService', () => {
  let service: FaceAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaceAuthService],
    }).compile();

    service = module.get<FaceAuthService>(FaceAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
