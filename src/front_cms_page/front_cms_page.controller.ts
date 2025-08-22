import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FrontCmsPageService } from './front_cms_page.service';
import { FrontCmsPage } from './entities/front_cms_page.entity';

@Controller('front-cms-page')
export class FrontCmsPageController {
  constructor(private readonly frontCmsPageService: FrontCmsPageService) { }

  @Post()
  create(@Body() createFrontCmsPage: FrontCmsPage) {
    return this.frontCmsPageService.create(createFrontCmsPage);
  }

  @Delete('/:id')
  async removeFrontCMSPage(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSPage = await this.frontCmsPageService.removeFrontCMSPage(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }



  @Patch('/:id')
  updateFrontCMSPage(@Param('id') id: number, @Body() createFrontCmsPage: FrontCmsPage) {
    return this.frontCmsPageService.updateFrontCMSPage(id, createFrontCmsPage);
  }

  // @Get()
  // findAll() {
  //   return this.frontCmsPageService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.frontCmsPageService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createFrontCmsPage: FrontCmsPage) {
  //   return this.frontCmsPageService.update(+id, createFrontCmsPage);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.frontCmsPageService.remove(+id);
  // }

}
