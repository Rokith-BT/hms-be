import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FrontCmsBannerService } from './front_cms_banner.service';
import { FrontCmsBanner } from './entities/front_cms_banner.entity';

@Controller('front-cms-banner')
export class FrontCmsBannerController {
  constructor(private readonly frontCmsBannerService: FrontCmsBannerService) { }

  @Post()
  create(@Body() createFrontCmsBanner: FrontCmsBanner) {
    return this.frontCmsBannerService.create(createFrontCmsBanner);
  }


  @Delete('/removeBanner/:id')
  async removeFrontCMSBanner(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSBanner = await this.frontCmsBannerService.removeFrontCMSBanner(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }



  @Post('/banner')
  createbanner(@Body() createFrontCmsBanner: FrontCmsBanner) {
    return this.frontCmsBannerService.createbanner(createFrontCmsBanner);
  }


  // @Get()
  // findAll() {
  //   return this.frontCmsBannerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.frontCmsBannerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createFrontCmsBanner: FrontCmsBanner) {
  //   return this.frontCmsBannerService.update(+id, createFrontCmsBanner);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.frontCmsBannerService.remove(+id);
  // }
}
