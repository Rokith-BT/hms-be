import { Module } from '@nestjs/common';
import { ComponentIssueService } from './component_issue.service';
import { ComponentIssueController } from './component_issue.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [ComponentIssueController],
  providers: [ComponentIssueService,DynamicDatabaseService],
})
export class ComponentIssueModule {}
