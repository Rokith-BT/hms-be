import { Module } from '@nestjs/common';
import { SetupHumanResourceLeaveTypesService } from './setup-human_resource-leave_types.service';
import { SetupHumanResourceLeaveTypesController } from './setup-human_resource-leave_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupHumanResourceLeaveType } from './entities/setup-human_resource-leave_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupHumanResourceLeaveType])],

  controllers: [SetupHumanResourceLeaveTypesController],
  providers: [SetupHumanResourceLeaveTypesService],
})
export class SetupHumanResourceLeaveTypesModule { }
