import { Test, TestingModule } from '@nestjs/testing';
import { OpHubInternalAppntDoctorsController } from './op-hub-internal-appnt-doctors.controller';
import { OpHubInternalAppntDoctorsService } from './op-hub-internal-appnt-doctors.service';

describe('OpHubInternalAppntDoctorsController', () => {
  let controller: OpHubInternalAppntDoctorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubInternalAppntDoctorsController],
      providers: [OpHubInternalAppntDoctorsService],
    }).compile();

    controller = module.get<OpHubInternalAppntDoctorsController>(OpHubInternalAppntDoctorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
