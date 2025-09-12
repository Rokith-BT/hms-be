import { Module } from '@nestjs/common';
import { SetupOperationOperationCategoryService } from './setup-operation-operation_category.service';
import { SetupOperationOperationCategoryController } from './setup-operation-operation_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupOperationOperationCategory } from './entities/setup-operation-operation_category.entity';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
 
@Module({
  imports:[ TypeOrmModule.forFeature([SetupOperationOperationCategory])],
 
  controllers: [SetupOperationOperationCategoryController],
  providers: [SetupOperationOperationCategoryService,DynamicDatabaseService],
})
export class SetupOperationOperationCategoryModule {}