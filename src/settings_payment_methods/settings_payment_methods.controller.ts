import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsPaymentMethodsService } from './settings_payment_methods.service';
import { SettingsPaymentMethod } from './entities/settings_payment_method.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('settings-payment-methods')
export class SettingsPaymentMethodsController {
  constructor(private readonly settingsPaymentMethodsService: SettingsPaymentMethodsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() SettingsPaymentMethodEntity: SettingsPaymentMethod) {
    return this.settingsPaymentMethodsService.create(SettingsPaymentMethodEntity);
  }

 

  
}
