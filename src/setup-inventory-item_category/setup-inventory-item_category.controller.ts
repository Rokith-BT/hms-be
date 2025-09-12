import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SetupInventoryItemCategoryService } from './setup-inventory-item_category.service';
import { SetupInventoryItemCategory } from './entities/setup-inventory-item_category.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('setup-inventory-item-category')
export class SetupInventoryItemCategoryController {
  constructor(private readonly setupInventoryItemCategoryService: SetupInventoryItemCategoryService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() item_categoryEntity: SetupInventoryItemCategory) {
    return this.setupInventoryItemCategoryService.create(item_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupInventoryItemCategoryService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupInventoryItemCategoryService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() item_categoryEntity: SetupInventoryItemCategory) {
    return this.setupInventoryItemCategoryService.update(id, item_categoryEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('Hospital_id') Hospital_id: number) {
    return this.setupInventoryItemCategoryService.remove(id, Hospital_id);
  }

  @UseGuards(AuthGuard)
  @Get('/keyword/setupInventoryItemCategory/:search')
  setupinventoryItemCategory(@Param('search') search: string) {

    return this.setupInventoryItemCategoryService.setupinventoryItemCategory(search);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/getallitem_category')
  async findallitem_category(@Query('limit') limit: number, @Query('page') page: number) {
    try {
      let final_output = await this.setupInventoryItemCategoryService.findALLitem_category(
        limit || 10,
        page || 1
      )

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total
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


  @UseGuards(AuthGuard)
  @Get("/v2/Setup_Inventory_Item_Category")
  async findInventoryItemCategorySearch(
    @Query('search') search?: string,
    @Query("limit") limit?: number,
    @Query("page") page?: number
  ) {
    try {
      let final_out = await this.setupInventoryItemCategoryService.findInventoryItemCategorySearch(
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
