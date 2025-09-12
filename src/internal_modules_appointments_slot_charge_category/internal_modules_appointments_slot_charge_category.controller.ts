import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InternalModulesAppointmentsSlotChargeCategoryService } from './internal_modules_appointments_slot_charge_category.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-modules-appointments-slot-charge-category')
export class InternalModulesAppointmentsSlotChargeCategoryController {
  constructor(private readonly internalModulesAppointmentsSlotChargeCategoryService: InternalModulesAppointmentsSlotChargeCategoryService) { }

  @UseGuards(AuthGuard)
  @Get()
  findone() {
    return this.internalModulesAppointmentsSlotChargeCategoryService.findone();
  }


}
