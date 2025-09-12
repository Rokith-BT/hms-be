import { Module } from '@nestjs/common';
import { DashboardStaffService } from './dashboard_staff.service';
import { DashboardStaffController } from './dashboard_staff.controller';

@Module({
  controllers: [DashboardStaffController],
  providers: [DashboardStaffService],
})
export class DashboardStaffModule {}
