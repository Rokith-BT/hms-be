import { Module } from '@nestjs/common';
import { InternalModulesChargeCategoryService } from './internal_modules_charge_category.service';
import { InternalModulesChargeCategoryController } from './internal_modules_charge_category.controller';

@Module({
  controllers: [InternalModulesChargeCategoryController],
  providers: [InternalModulesChargeCategoryService],
})
export class InternalModulesChargeCategoryModule { }
