import { Module } from '@nestjs/common';
import { SetupRadiologyRadiologyCategoryService } from './setup-radiology-radiology_category.service';
import { SetupRadiologyRadiologyCategoryController } from './setup-radiology-radiology_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupRadiologyRadiologyCategory } from './entities/setup-radiology-radiology_category.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupRadiologyRadiologyCategory])],

  controllers: [SetupRadiologyRadiologyCategoryController],
  providers: [SetupRadiologyRadiologyCategoryService,DynamicDatabaseService],
})
export class SetupRadiologyRadiologyCategoryModule {}
