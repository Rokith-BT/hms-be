import { Module } from '@nestjs/common';
import { FindingsCategoryService } from './findings_category.service';
import { FindingsCategoryController } from './findings_category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindingsCategory } from './entities/findings_category.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([FindingsCategory])],
  controllers: [FindingsCategoryController],
  providers: [FindingsCategoryService],
})
export class FindingsCategoryModule {}
