import { Test, TestingModule } from '@nestjs/testing';
import { OpHubClinicalNotesWithAbhaService } from './op-hub-clinical-notes-with-abha.service';

describe('OpHubClinicalNotesWithAbhaService', () => {
  let service: OpHubClinicalNotesWithAbhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubClinicalNotesWithAbhaService],
    }).compile();

    service = module.get<OpHubClinicalNotesWithAbhaService>(OpHubClinicalNotesWithAbhaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
