import { Test, TestingModule } from '@nestjs/testing';
import { QrEncrpytService } from './qr-encrpyt.service';

describe('QrEncrpytService', () => {
  let service: QrEncrpytService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrEncrpytService],
    }).compile();

    service = module.get<QrEncrpytService>(QrEncrpytService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
