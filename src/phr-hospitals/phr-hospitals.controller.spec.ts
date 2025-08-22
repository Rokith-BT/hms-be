import { Test, TestingModule } from '@nestjs/testing';
import { PhrHospitalsController } from './phr-hospitals.controller';
import { PhrHospitalsService } from './phr-hospitals.service';

describe('PhrHospitalsController', () => {
  let controller: PhrHospitalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhrHospitalsController],
      providers: [PhrHospitalsService],
    }).compile();

    controller = module.get<PhrHospitalsController>(PhrHospitalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
