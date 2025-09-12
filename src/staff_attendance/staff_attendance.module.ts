import { Module } from '@nestjs/common';
import { StaffAttendanceService } from './staff_attendance.service';
import { StaffAttendanceController } from './staff_attendance.controller';

@Module({
  controllers: [StaffAttendanceController],
  providers: [StaffAttendanceService],
})
export class StaffAttendanceModule {}
