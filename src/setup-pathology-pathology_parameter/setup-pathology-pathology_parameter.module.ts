import { Module } from '@nestjs/common';
import { SetupPathologyPathologyParameterService } from './setup-pathology-pathology_parameter.service';
import { SetupPathologyPathologyParameterController } from './setup-pathology-pathology_parameter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupPathologyPathologyParameter } from './entities/setup-pathology-pathology_parameter.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupPathologyPathologyParameter])],

  controllers: [SetupPathologyPathologyParameterController],
  providers: [SetupPathologyPathologyParameterService,DynamicDatabaseService],
})
export class SetupPathologyPathologyParameterModule {}
