import { Test, TestingModule } from '@nestjs/testing';
import { OpHubClinicalNotesService } from './op-hub-clinical-notes.service';

describe('OpHubClinicalNotesService', () => {
  let service: OpHubClinicalNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpHubClinicalNotesService],
    }).compile();

    service = module.get<OpHubClinicalNotesService>(OpHubClinicalNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
