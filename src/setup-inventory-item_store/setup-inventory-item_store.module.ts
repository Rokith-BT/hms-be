import { Module } from '@nestjs/common';
import { SetupInventoryItemStoreService } from './setup-inventory-item_store.service';
import { SetupInventoryItemStoreController } from './setup-inventory-item_store.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupInventoryItemStore } from './entities/setup-inventory-item_store.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupInventoryItemStore])],

  controllers: [SetupInventoryItemStoreController],
  providers: [SetupInventoryItemStoreService,DynamicDatabaseService],
})
export class SetupInventoryItemStoreModule {}
