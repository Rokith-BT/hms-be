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
import { PharmacyGenerateBillService } from './pharmacy_generate_bill.service';
import { PharmacyGenerateBill } from './entities/pharmacy_generate_bill.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('pharmacy-generate-bill')
export class PharmacyGenerateBillController {
  constructor(
    private readonly pharmacyGenerateBillService: PharmacyGenerateBillService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPharmacyGenerateBill: PharmacyGenerateBill) {
    return this.pharmacyGenerateBillService.create(createPharmacyGenerateBill);
  }
  @UseGuards(AuthGuard)
  @Post('/medicineBillDetails')
  createMedicineBillDetails(
    @Body() createPurchaseMedicine: PharmacyGenerateBill[],
  ) {
    return this.pharmacyGenerateBillService.createMedicineBillDetails(
      createPurchaseMedicine,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id') id: number,
    @Body() createPharmacyGenerateBill: PharmacyGenerateBill,
  ) {
    return this.pharmacyGenerateBillService.update(
      id,
      createPharmacyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Patch('/billdetailupdate/PharmacyBillDetail')
  PharmaBillDetail(@Body() updatePharmaBillDetail: PharmacyGenerateBill[]) {
    return this.pharmacyGenerateBillService.PharmaBillDetail(
      updatePharmaBillDetail,
    );
  }
  @UseGuards(AuthGuard)
  @Post('/AddPayment')
  AddPayment(@Body() createPharmacyGenerateBill: PharmacyGenerateBill) {
    return this.pharmacyGenerateBillService.AddPayment(
      createPharmacyGenerateBill,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removePharmacyBill(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pharmacyGenerateBillService.removePharmacyBill(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/deletePayment/:id')
  async removePayment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pharmacyGenerateBillService.removePayment(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/paymentListByBillBasicId/:id')
  paymentsListByBillBasicID(@Param('id') id: number) {
    return this.pharmacyGenerateBillService.paymentsListByBillBasicID(id);
  }
  @UseGuards(AuthGuard)
  @Get('/getPrescDetailsByprescID/:id')
  getPrescDetailsByprescID(@Param('id') id: string) {
    return this.pharmacyGenerateBillService.getPrescDetailsByprescID(id);
  }
  @UseGuards(AuthGuard)
  @Get('/getmedicinedetailsByBatchno/:id')
  getmedicinedetailsByBatchno(@Param('id') id: string) {
    return this.pharmacyGenerateBillService.getmedicinedetailsByBatchno(id);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.pharmacyGenerateBillService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/:search')
  findPharmacyBillByAll(@Param('search') search: string) {
    return this.pharmacyGenerateBillService.findPharmacyBillByAll(search);
  }
  @UseGuards(AuthGuard)
  @Get('/getPharmacybillbyID/:id')
  getPharmacybillbyID(@Param('id') id: string) {
    return this.pharmacyGenerateBillService.getPharmacybillbyID(id);
  }
  @UseGuards(AuthGuard)
  @Delete('/removePharmaBillDetail/:id')
  async removePharmaBillDetail(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pharmacyGenerateBillService.removePharmaBillDetail(
      id,
      hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
}
