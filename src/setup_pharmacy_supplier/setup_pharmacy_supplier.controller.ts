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
import { SetupPharmacySupplierService } from './setup_pharmacy_supplier.service';
import { SetupPharmacySupplier } from './entities/setup_pharmacy_supplier.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-pharmacy-supplier')
export class SetupPharmacySupplierController {
  constructor(
    private readonly setupPharmacySupplierService: SetupPharmacySupplierService,
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() supplierEntity: SetupPharmacySupplier) {
    return this.setupPharmacySupplierService.create(supplierEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPharmacySupplierService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPharmacySupplierService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() supplierEntity: SetupPharmacySupplier,
  ) {
    return this.setupPharmacySupplierService.update(id, supplierEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupPharmacySupplierService.remove(id, Hospital_id);
  }

  @UseGuards(AuthGuard)

  @Get('/v2/getAllpharmacy_supplier')
  async getallpharmacysupplier(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupPharmacySupplierService.findallpharmacy_supplier(
        limit || 10,
        page || 1
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalpages: Math.ceil(final_output.total / final_output.limit),
        }
      }


    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE
      }
    }
  }
}
