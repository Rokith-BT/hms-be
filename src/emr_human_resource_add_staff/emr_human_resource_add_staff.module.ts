import { Module } from '@nestjs/common';
import { EmrHumanResourceAddStaffService } from './emr_human_resource_add_staff.service';
import { EmrHumanResourceAddStaffController } from './emr_human_resource_add_staff.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrHumanResourceAddStaff } from './entities/emr_human_resource_add_staff.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([EmrHumanResourceAddStaff])],

  controllers: [EmrHumanResourceAddStaffController],
  providers: [EmrHumanResourceAddStaffService,DynamicDatabaseService],
})
export class EmrHumanResourceAddStaffModule {}
