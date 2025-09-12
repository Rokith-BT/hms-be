import { Test, TestingModule } from '@nestjs/testing';
import { FaceAuthController } from './face-auth.controller';
import { FaceAuthService } from './face-auth.service';

describe('FaceAuthController', () => {
  let controller: FaceAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaceAuthController],
      providers: [FaceAuthService],
    }).compile();

    controller = module.get<FaceAuthController>(FaceAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
