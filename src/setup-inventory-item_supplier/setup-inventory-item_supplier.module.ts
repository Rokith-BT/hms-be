import { Module } from '@nestjs/common';
import { SetupInventoryItemSupplierService } from './setup-inventory-item_supplier.service';
import { SetupInventoryItemSupplierController } from './setup-inventory-item_supplier.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupInventoryItemSupplier } from './entities/setup-inventory-item_supplier.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SetupInventoryItemSupplier])],

  controllers: [SetupInventoryItemSupplierController],
  providers: [SetupInventoryItemSupplierService,DynamicDatabaseService],
})
export class SetupInventoryItemSupplierModule {}
