import { Module } from '@nestjs/common';
import { SetupBloodBankProductsService } from './setup-blood_bank-products.service';
import { SetupBloodBankProductsController } from './setup-blood_bank-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { SetupBloodBankProduct } from './entities/setup-blood_bank-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetupBloodBankProduct])],

  controllers: [SetupBloodBankProductsController],
  providers: [SetupBloodBankProductsService, DynamicDatabaseService],
})
export class SetupBloodBankProductsModule {}
