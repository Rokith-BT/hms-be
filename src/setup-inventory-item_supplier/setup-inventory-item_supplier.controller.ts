import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupInventoryItemSupplierService } from './setup-inventory-item_supplier.service';
import { SetupInventoryItemSupplier } from './entities/setup-inventory-item_supplier.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-inventory-item-supplier')
export class SetupInventoryItemSupplierController {
  constructor(private readonly setupInventoryItemSupplierService: SetupInventoryItemSupplierService) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() item_supplierEntity: SetupInventoryItemSupplier ) {
    return this.setupInventoryItemSupplierService.create(item_supplierEntity);
  }
@UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupInventoryItemSupplierService.findAll();
  }
@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupInventoryItemSupplierService.findOne(id);
  }
@UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body()  item_supplierEntity: SetupInventoryItemSupplier ) {
    return this.setupInventoryItemSupplierService.update(id,item_supplierEntity );
  }
@UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query(`Hospital_id`) Hospital_id:number) {
    return this.setupInventoryItemSupplierService.remove(id,Hospital_id);
  }

@UseGuards(AuthGuard)
  @Get('/keyword/setupInventoryItemSupplier/:search')
  setupInventoryItemSupplier(@Param('search') search: string) {
   
    return this.setupInventoryItemSupplierService.setupInventoryItemSupplier(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Inventory_Item_Supplier")
  async findInventoryItemSupplierSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupInventoryItemSupplierService.findInventoryItemSupplierSearch(
        search,
        limit || 10,
        page || 1
      );
 
    if (final_out.details.length > 0) {
      return {
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.SUCCESS_MESSAGE,
        data: final_out.details,
        total: final_out.total,
      };
    }
    else{
      return{
        status_code: process.env.SUCCESS_STATUS_CODE,
        status: process.env.SUCCESS_STATUS,
        message: process.env.DATA_NOT_FOUND
      }
    }
    } catch (error) {
  return{
    status_code: process.env.ERROR_STATUS_CODE,
    status: process.env.ERROR_STATUS,
    message: process.env.ERROR_MESSAGE
  }      
    }
   
  }


}
