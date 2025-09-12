import { Test, TestingModule } from '@nestjs/testing';
import { ModulesPatientController } from './modules_patient.controller';
import { ModulesPatientService } from './modules_patient.service';

describe('ModulesPatientController', () => {
  let controller: ModulesPatientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulesPatientController],
      providers: [ModulesPatientService],
    }).compile();

    controller = module.get<ModulesPatientController>(ModulesPatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
