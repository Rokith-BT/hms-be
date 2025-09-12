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
import { PharmacyService } from './pharmacy.service';
import { Pharmacy } from './entities/pharmacy.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPharmacy: Pharmacy) {
    return this.pharmacyService.create(createPharmacy);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createPharmacy: Pharmacy) {
    return this.pharmacyService.update(id, createPharmacy);
  }
  @UseGuards(AuthGuard)
  @Delete('/deletePharmacy/:id')
  async removeNurseNoteComment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    const DeletePharmacy = await this.pharmacyService.removePharmacy(
      id,
      Hospital_id,
    );
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.pharmacyService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('/stock/:search')
  findMedicineStock(@Param('search') search: string) {
    return this.pharmacyService.findMedicineStock(search);
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Get('/goodMedicineStock/:id')
  findGoodMedicineStock(@Param('id') id: string) {
    return this.pharmacyService.findGoodMedicineStock(id);
  }
  @UseGuards(AuthGuard)
  @Get('/badMedicineStock/:id')
  findBadMedicineStock(@Param('id') id: string) {
    return this.pharmacyService.findBadMedicineStock(id);
  }
  @UseGuards(AuthGuard)
  @Post('/badMedicineStock')
  createBadMedicineStock(@Body() createPharmacy: Pharmacy) {
    return this.pharmacyService.createBadMedicineStock(createPharmacy);
  }
  @UseGuards(AuthGuard)
  @Delete('/deleteBadMedicineStock/:id')
  async DeleteBadMedicineStock(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pharmacyService.DeleteBadMedicineStock(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/MedicineGoodStock/:id')
  async removeGoodMedicine(
    @Param('id') id: number,
    @Query('hospital_id') hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.pharmacyService.removeGoodMedicine(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
}
