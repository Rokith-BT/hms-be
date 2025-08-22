import { Module } from '@nestjs/common';
import { SetupPathologyUnitService } from './setup-pathology-unit.service';
import { SetupPathologyUnitController } from './setup-pathology-unit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupPathologyUnit } from './entities/setup-pathology-unit.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupPathologyUnit])],

  controllers: [SetupPathologyUnitController],
  providers: [SetupPathologyUnitService,DynamicDatabaseService],
})
export class SetupPathologyUnitModule {}
