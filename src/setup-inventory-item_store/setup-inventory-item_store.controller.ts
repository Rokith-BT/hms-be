import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupInventoryItemStoreService } from './setup-inventory-item_store.service';
import { SetupInventoryItemStore } from './entities/setup-inventory-item_store.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-inventory-item-store')
export class SetupInventoryItemStoreController {
  constructor(private readonly setupInventoryItemStoreService: SetupInventoryItemStoreService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() item_storeEntity: SetupInventoryItemStore) {
    return this.setupInventoryItemStoreService.create(item_storeEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupInventoryItemStoreService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupInventoryItemStoreService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() item_storeEntity: SetupInventoryItemStore) {
    return this.setupInventoryItemStoreService.update(id, item_storeEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupInventoryItemStoreService.remove(id, Hospital_id);
  }
  @UseGuards(AuthGuard)
  @Get('/keyword/setupInventoryItemStore/:search')
  setupInventoryItemStore(@Param('search') search: string) {

    return this.setupInventoryItemStoreService.setupInventoryItemStore(search);
  }

  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Inventory_Item_Store")
  async findInventoryItemStoreSearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupInventoryItemStoreService.findInventoryItemStoreSearch(
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
      else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND
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
