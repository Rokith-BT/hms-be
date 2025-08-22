import { Module } from '@nestjs/common';
import { HumanResourceApplyLeaveService } from './human_resource_apply_leave.service';
import { HumanResourceApplyLeaveController } from './human_resource_apply_leave.controller';

@Module({
  controllers: [HumanResourceApplyLeaveController],
  providers: [HumanResourceApplyLeaveService],
})
export class HumanResourceApplyLeaveModule { }
