import { Module } from '@nestjs/common';
import { HumanResourceStaffService } from './human_resource_staff.service';
import { HumanResourceStaffController } from './human_resource_staff.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
 
@Module({
  controllers: [HumanResourceStaffController],
  providers: [HumanResourceStaffService,DynamicDatabaseService],
})
export class HumanResourceStaffModule {}