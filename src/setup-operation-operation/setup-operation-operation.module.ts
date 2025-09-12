import { Module } from '@nestjs/common';
import { SetupOperationOperationService } from './setup-operation-operation.service';
import { SetupOperationOperationController } from './setup-operation-operation.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupOperationOperation } from './entities/setup-operation-operation.entity';
 
@Module({
  imports:[ TypeOrmModule.forFeature([SetupOperationOperation])],
 
  controllers: [SetupOperationOperationController],
  providers: [SetupOperationOperationService,DynamicDatabaseService],
})
export class SetupOperationOperationModule {}
 