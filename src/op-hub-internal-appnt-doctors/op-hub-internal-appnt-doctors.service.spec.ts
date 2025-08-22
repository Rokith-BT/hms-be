import { Test, TestingModule } from '@nestjs/testing';
import { OpHubInternalAppntDoctorsService } from './op-hub-internal-appnt-doctors.service';

describe('OpHubInternalAppntDoctorsService', () => {
  let service: OpHubInternalAppntDoctorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubInternalAppntDoctorsService],
    }).compile();

    service = module.get<OpHubInternalAppntDoctorsService>(OpHubInternalAppntDoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
