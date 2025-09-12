import { Test, TestingModule } from '@nestjs/testing';
import { OpHubClinicalNotesController } from './op-hub-clinical-notes.controller';
import { OpHubClinicalNotesService } from './op-hub-clinical-notes.service';

describe('OpHubClinicalNotesController', () => {
  let controller: OpHubClinicalNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpHubClinicalNotesController],
      providers: [OpHubClinicalNotesService],
    }).compile();

    controller = module.get<OpHubClinicalNotesController>(OpHubClinicalNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
