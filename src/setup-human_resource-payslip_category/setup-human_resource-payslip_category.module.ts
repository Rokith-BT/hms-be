import { Module } from '@nestjs/common';
import { SetupHumanResourcePayslipCategoryService } from './setup-human_resource-payslip_category.service';
import { SetupHumanResourcePayslipCategoryController } from './setup-human_resource-payslip_category.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [SetupHumanResourcePayslipCategoryController],
  providers: [SetupHumanResourcePayslipCategoryService,DynamicDatabaseService],
})
export class SetupHumanResourcePayslipCategoryModule {}
