import { Test, TestingModule } from '@nestjs/testing';
import { OpHubDoctorsService } from './op-hub-doctors.service';

describe('OpHubDoctorsService', () => {
  let service: OpHubDoctorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubDoctorsService],
    }).compile();

    service = module.get<OpHubDoctorsService>(OpHubDoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
