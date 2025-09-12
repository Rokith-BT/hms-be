import { Test, TestingModule } from '@nestjs/testing';
import { OpHubLoginController } from './op-hub-login.controller';
import { OpHubLoginService } from './op-hub-login.service';

describe('OpHubLoginController', () => {
  let controller: OpHubLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubLoginController],
      providers: [OpHubLoginService],
    }).compile();

    controller = module.get<OpHubLoginController>(OpHubLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
