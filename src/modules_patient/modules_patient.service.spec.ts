import { Test, TestingModule } from '@nestjs/testing';
import { ModulesPatientService } from './modules_patient.service';

describe('ModulesPatientService', () => {
  let service: ModulesPatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulesPatientService],
    }).compile();

    service = module.get<ModulesPatientService>(ModulesPatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
