import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FrontCmsMenuService } from './front_cms_menu.service';
import { FrontCmsMenu } from './entities/front_cms_menu.entity';

@Controller('front-cms-menu')
export class FrontCmsMenuController {
  constructor(private readonly frontCmsMenuService: FrontCmsMenuService) { }

  @Post()
  create(@Body() createFrontCmsMenu: FrontCmsMenu) {
    return this.frontCmsMenuService.create(createFrontCmsMenu);
  }


  @Delete('/removeMenu/:id')
  async removeFrontCMSMenu(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSMenu = await this.frontCmsMenuService.removeFrontCMSMenu(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  @Post('/addMenuItems')
  createMenuItems(@Body() createFrontCmsMenu: FrontCmsMenu) {
    return this.frontCmsMenuService.createMenuItems(createFrontCmsMenu);
  }


  @Patch('/updateMenuItems/:id')
  updateFrontCMSMenuItems(@Param('id') id: number, @Body() createFrontCmsMenu: FrontCmsMenu) {
    return this.frontCmsMenuService.updateFrontCMSMenuItems(id, createFrontCmsMenu);
  }


  @Delete('/removeMenuItems/:id')
  async removeFrontCMSMenuItems(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSMenuItems = await this.frontCmsMenuService.removeFrontCMSMenuItems(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }




  // @Get()
  // findAll() {
  //   return this.frontCmsMenuService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.frontCmsMenuService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createFrontCmsMenu: FrontCmsMenu) {
  //   return this.frontCmsMenuService.update(+id, createFrontCmsMenu);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.frontCmsMenuService.remove(+id);
  // }
}
