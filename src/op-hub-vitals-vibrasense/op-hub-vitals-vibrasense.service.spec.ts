import { Test, TestingModule } from '@nestjs/testing';
import { OpHubVitalsVibrasenseService } from './op-hub-vitals-vibrasense.service';

describe('OpHubVitalsVibrasenseService', () => {
  let service: OpHubVitalsVibrasenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubVitalsVibrasenseService],
    }).compile();

    service = module.get<OpHubVitalsVibrasenseService>(OpHubVitalsVibrasenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
