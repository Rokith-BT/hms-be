import { Module } from '@nestjs/common';
import { SetupRadiologyUnitService } from './setup-radiology-unit.service';
import { SetupRadiologyUnitController } from './setup-radiology-unit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupRadiologyUnit } from './entities/setup-radiology-unit.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([SetupRadiologyUnit])],

  controllers: [SetupRadiologyUnitController],
  providers: [SetupRadiologyUnitService, DynamicDatabaseService],
})
export class SetupRadiologyUnitModule {}
