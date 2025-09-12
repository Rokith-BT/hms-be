import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DashboardStaffService } from './dashboard_staff.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('dashboard-staff')
export class DashboardStaffController {
  constructor(private readonly dashboardStaffService: DashboardStaffService) {}

  
  @UseGuards(AuthGuard)
  @Get('/v2/getstaffdashboard')
async  findAll() {
    return this.dashboardStaffService.staff_dashboard();
  }

   @UseGuards(AuthGuard)
  @Get('/v2/getmonthlyincome')
async  findincome() {
    return this.dashboardStaffService.monthly_income();
  }


    @UseGuards(AuthGuard)
  @Get('/v2/getyearlyincome')
async  findincomeyearly() {
    return this.dashboardStaffService.yearly_income();
  }


    @UseGuards(AuthGuard)
  @Get('/v2/getyearlyexpense')
async  findexpenseyearly() {
    return this.dashboardStaffService.yearly_expense();
  }
}
