import { Test, TestingModule } from '@nestjs/testing';
import { PhpAppointmentReportService } from './php-appointment-report.service';

describe('PhpAppointmentReportService', () => {
  let service: PhpAppointmentReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhpAppointmentReportService],
    }).compile();

    service = module.get<PhpAppointmentReportService>(PhpAppointmentReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
