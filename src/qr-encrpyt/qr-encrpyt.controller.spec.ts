import { Test, TestingModule } from '@nestjs/testing';
import { QrEncrpytController } from './qr-encrpyt.controller';
import { QrEncrpytService } from './qr-encrpyt.service';

describe('QrEncrpytController', () => {
  let controller: QrEncrpytController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrEncrpytController],
      providers: [QrEncrpytService],
    }).compile();

    controller = module.get<QrEncrpytController>(QrEncrpytController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
