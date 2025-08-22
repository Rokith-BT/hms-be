import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FrontCmsEventGalleryNewsService } from './front_cms_event_gallery_news.service';
import { FrontCmsEventGalleryNew } from './entities/front_cms_event_gallery_new.entity';


@Controller('front-cms-event-gallery-news')
export class FrontCmsEventGalleryNewsController {
  constructor(private readonly frontCmsEventGalleryNewsService: FrontCmsEventGalleryNewsService) { }

  @Post('/event')
  create(@Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.create(createFrontCmsEventGalleryNew);
  }


  @Post('/news')
  createNews(@Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.createNews(createFrontCmsEventGalleryNew);
  }


  @Post('/gallery')
  createGallery(@Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.createGallery(createFrontCmsEventGalleryNew);
  }



  @Delete('/removeEvent/:id')
  async removeFrontCMSEvent(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSevent = await this.frontCmsEventGalleryNewsService.removeFrontCMSEvent(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  @Delete('/removeNews/:id')
  async removeFrontCMSNews(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSNews = await this.frontCmsEventGalleryNewsService.removeFrontCMSNews(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  @Delete('/removeGallery/:id')
  async removeFrontCMSGallery(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteCMSNews = await this.frontCmsEventGalleryNewsService.removeFrontCMSGallery(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  @Patch('/updateEvent/:id')
  updateFrontCMSevent(@Param('id') id: number, @Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.updateFrontCMSevent(id, createFrontCmsEventGalleryNew);
  }



  @Patch('/updateNews/:id')
  updateFrontCMSNews(@Param('id') id: number, @Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.updateFrontCMSNews(id, createFrontCmsEventGalleryNew);
  }


  @Patch('/updateGallery/:id')
  updateFrontCMSGallery(@Param('id') id: number, @Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    return this.frontCmsEventGalleryNewsService.updateFrontCMSGallery(id, createFrontCmsEventGalleryNew);
  }


  // @Get()
  // findAll() {
  //   return this.frontCmsEventGalleryNewsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.frontCmsEventGalleryNewsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
  //   return this.frontCmsEventGalleryNewsService.update(+id, createFrontCmsEventGalleryNew);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.frontCmsEventGalleryNewsService.remove(+id);
  // }

}
