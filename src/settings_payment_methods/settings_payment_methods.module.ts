import { Module } from '@nestjs/common';
import { SettingsPaymentMethodsService } from './settings_payment_methods.service';
import { SettingsPaymentMethodsController } from './settings_payment_methods.controller';
import { DynamicDatabaseService } from 'src/dynamic_db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsPaymentMethod } from './entities/settings_payment_method.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([SettingsPaymentMethod])],

  controllers: [SettingsPaymentMethodsController],
  providers: [SettingsPaymentMethodsService,DynamicDatabaseService],
})
export class SettingsPaymentMethodsModule {}
