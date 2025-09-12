import { Test, TestingModule } from '@nestjs/testing';
import { SarvamJobOpdIdMappingController } from './sarvam_job_opd_id_mapping.controller';
import { SarvamJobOpdIdMappingService } from './sarvam_job_opd_id_mapping.service';

describe('SarvamJobOpdIdMappingController', () => {
  let controller: SarvamJobOpdIdMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SarvamJobOpdIdMappingController],
      providers: [SarvamJobOpdIdMappingService],
    }).compile();

    controller = module.get<SarvamJobOpdIdMappingController>(SarvamJobOpdIdMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
