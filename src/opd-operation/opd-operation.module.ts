import { Module } from '@nestjs/common';
import { OpdOperationService } from './opd-operation.service';
import { OpdOperationController } from './opd-operation.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [OpdOperationController],
  providers: [OpdOperationService, DynamicDatabaseService],
})
export class OpdOperationModule { }
