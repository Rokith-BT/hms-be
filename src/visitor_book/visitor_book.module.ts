import { Module } from '@nestjs/common';
import { VisitorBookService } from './visitor_book.service';
import { VisitorBookController } from './visitor_book.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [VisitorBookController],
  providers: [VisitorBookService,DynamicDatabaseService],
})
export class VisitorBookModule {}
