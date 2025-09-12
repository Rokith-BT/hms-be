import { Module } from '@nestjs/common';
import { InternalModulesAppointmentsSlotChargeCategoryService } from './internal_modules_appointments_slot_charge_category.service';
import { InternalModulesAppointmentsSlotChargeCategoryController } from './internal_modules_appointments_slot_charge_category.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [InternalModulesAppointmentsSlotChargeCategoryController],
  providers: [InternalModulesAppointmentsSlotChargeCategoryService, DynamicDatabaseService],
})
export class InternalModulesAppointmentsSlotChargeCategoryModule { }
