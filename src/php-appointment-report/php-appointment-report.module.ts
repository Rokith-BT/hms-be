import { Module } from '@nestjs/common';
import { PhpAppointmentReportService } from './php-appointment-report.service';
import { PhpAppointmentReportController } from './php-appointment-report.controller';

@Module({
  controllers: [PhpAppointmentReportController],
  providers: [PhpAppointmentReportService],
})
export class PhpAppointmentReportModule {}
