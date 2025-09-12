import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseMedicineService } from './purchase_medicine.service';
import { PurchaseMedicine } from './entities/purchase_medicine.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('purchase-medicine')
export class PurchaseMedicineController {
  constructor(
    private readonly purchaseMedicineService: PurchaseMedicineService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPurchaseMedicine: PurchaseMedicine) {
    return this.purchaseMedicineService.create(createPurchaseMedicine);
  }
  @UseGuards(AuthGuard)
  @Post('/medicineBatchDetails')
  createMedicineBatchDetails(
    @Body() createPurchaseMedicine: PurchaseMedicine[],
  ) {
    return this.purchaseMedicineService.createMedicineBatchDetails(
      createPurchaseMedicine,
    );
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.purchaseMedicineService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/purchase/:search')
  findPurchaseMedicine(@Param('search') search: string) {
    return this.purchaseMedicineService.findPurchaseMedicine(search);
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseMedicineService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePurchaseMedicine(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.purchaseMedicineService.removePurchaseMedicine(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/medicine/supplier')
  findMedicineSupplier() {
    return this.purchaseMedicineService.findMedicineSupplier();
  }
  @UseGuards(AuthGuard)
  @Get('/medicine/category')
  findMedicineCategory() {
    return this.purchaseMedicineService.findMedicineCategory();
  }
  @UseGuards(AuthGuard)
  @Get('/findMedicine/:id')
  findMedicineName(@Param('id') id: number) {
    return this.purchaseMedicineService.findMedicineName(id);
  }
  @UseGuards(AuthGuard)
  @Get('/findMedicineTax/:id')
  findTaxByMedicineName(@Param('id') id: number) {
    return this.purchaseMedicineService.findTaxByMedicineName(id);
  }
}
