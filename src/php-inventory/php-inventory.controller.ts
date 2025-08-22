import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PhpInventoryService } from './php-inventory.service';
import { PhpInventory } from './entities/php-inventory.entity';
@Controller('php-inventory')
export class PhpInventoryController {
  constructor(private readonly phpInventoryService: PhpInventoryService) {}





  @Post('item')
  createItems(@Body() createPhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.createItem(createPhpInventoryDto);
  }
  @Post('item-issue')
  create(@Body() createPhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.createItemIssue(createPhpInventoryDto);
  }
  @Post('item-stock')
  createItemsStock(@Body() createPhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.createItemStock(createPhpInventoryDto);
  }
  @Get('item')
  findAllitems() {
    return this.phpInventoryService.findAllitems();
  }
  @Get('item-stock')
  findAllitemsStock() {
    return this.phpInventoryService.findAllitems_stock();
  }
  @Get('item-issue')
  findAll() {
    return this.phpInventoryService.findAllitems_issue();
  }
  @Patch('item/:id')
  updateitem(@Param('id') id: string, @Body() updatePhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.updateItems(+id, updatePhpInventoryDto);
  }

  @Patch('item-stock/:id')
  updateitemStock(@Param('id') id: string, @Body() updatePhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.updateItemStock(+id, updatePhpInventoryDto);
  }

  @Patch('item-issue/:id')
  update(@Param('id') id: string, @Body() updatePhpInventoryDto: PhpInventory) {
    return this.phpInventoryService.update(+id, updatePhpInventoryDto);
  }
  @Delete('/item/:id')
  removeItems(@Param('id') id: string,@Query('hospital_id') hospital_id: any) {
    return this.phpInventoryService.removeitem(+id,hospital_id);
  }
  @Delete('/item-stock/:id')
  removeItemsstock(@Param('id') id: string,@Query('hospital_id') hospital_id: any) {
    return this.phpInventoryService.removeitemStock(+id,hospital_id);
  }
  @Delete('/item-issue/:id')
  remove(@Param('id') id: string,@Query('hospital_id') hospital_id: any) {
    return this.phpInventoryService.remove(+id,hospital_id);
  }
}
