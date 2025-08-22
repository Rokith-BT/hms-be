import { Test, TestingModule } from '@nestjs/testing';
import { OpHubClinicalNotesWithAbhaController } from './op-hub-clinical-notes-with-abha.controller';
import { OpHubClinicalNotesWithAbhaService } from './op-hub-clinical-notes-with-abha.service';

describe('OpHubClinicalNotesWithAbhaController', () => {
  let controller: OpHubClinicalNotesWithAbhaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubClinicalNotesWithAbhaController],
      providers: [OpHubClinicalNotesWithAbhaService],
    }).compile();

    controller = module.get<OpHubClinicalNotesWithAbhaController>(OpHubClinicalNotesWithAbhaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
