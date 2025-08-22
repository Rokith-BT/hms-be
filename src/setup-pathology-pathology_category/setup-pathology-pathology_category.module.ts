import { Module } from '@nestjs/common';
import { SetupPathologyPathologyCategoryService } from './setup-pathology-pathology_category.service';
import { SetupPathologyPathologyCategoryController } from './setup-pathology-pathology_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupPathologyPathologyCategory } from './entities/setup-pathology-pathology_category.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupPathologyPathologyCategory])],

  controllers: [SetupPathologyPathologyCategoryController],
  providers: [SetupPathologyPathologyCategoryService,DynamicDatabaseService],
})
export class SetupPathologyPathologyCategoryModule {}
