import { Module } from '@nestjs/common';
import { PhpInventoryService } from './php-inventory.service';
import { PhpInventoryController } from './php-inventory.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';

@Module({
  controllers: [PhpInventoryController],
  providers: [PhpInventoryService,DynamicDatabaseService],
})
export class PhpInventoryModule {}
