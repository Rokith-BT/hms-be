import { Test, TestingModule } from '@nestjs/testing';
import { PhpAppointmentReportController } from './php-appointment-report.controller';
import { PhpAppointmentReportService } from './php-appointment-report.service';

describe('PhpAppointmentReportController', () => {
  let controller: PhpAppointmentReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhpAppointmentReportController],
      providers: [PhpAppointmentReportService],
    }).compile();

    controller = module.get<PhpAppointmentReportController>(PhpAppointmentReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
