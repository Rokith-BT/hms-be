import { Test, TestingModule } from '@nestjs/testing';
import { OpHubDoctorsController } from './op-hub-doctors.controller';
import { OpHubDoctorsService } from './op-hub-doctors.service';

describe('OpHubDoctorsController', () => {
  let controller: OpHubDoctorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubDoctorsController],
      providers: [OpHubDoctorsService],
    }).compile();

    controller = module.get<OpHubDoctorsController>(OpHubDoctorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
