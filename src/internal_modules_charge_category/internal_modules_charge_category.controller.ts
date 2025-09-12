import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InternalModulesChargeCategoryService } from './internal_modules_charge_category.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('internal-modules-charge-category')
export class InternalModulesChargeCategoryController {
  constructor(private readonly internalModulesChargeCategoryService: InternalModulesChargeCategoryService) { }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.internalModulesChargeCategoryService.findall(id);
  }
}
