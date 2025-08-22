import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SetupBloodBankProductsService } from './setup-blood_bank-products.service';
import { SetupBloodBankProduct } from './entities/setup-blood_bank-product.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('new-setup-blood-bank-products')
export class SetupBloodBankProductsController {
  constructor(
    private readonly setupBloodBankProductsService: SetupBloodBankProductsService,
  ) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() bloodproductsEntity: SetupBloodBankProduct) {
    return this.setupBloodBankProductsService.create(bloodproductsEntity);
  }
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupBloodBankProductsService.findAll();
  }
@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupBloodBankProductsService.findOne(id);
  }
@UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() bloodproductsEntity: SetupBloodBankProduct,
  ) {
    return this.setupBloodBankProductsService.update(id, bloodproductsEntity);
  }
@UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setupBloodBankProductsService.remove(id);
  }
@UseGuards(AuthGuard)
  @Get('/SetupBloodbankProducts/:search')
  SetupBloodBankProducts(@Param('search') search: string) {
    return this.setupBloodBankProductsService.SetupBloodBankProducts(search);
  }
}
