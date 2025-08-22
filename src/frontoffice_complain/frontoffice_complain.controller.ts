import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FrontofficeComplainService } from './frontoffice_complain.service';
import { FrontofficeComplain } from './entities/frontoffice_complain.entity';


@Controller('frontoffice-complain')
export class FrontofficeComplainController {
  constructor(private readonly frontofficeComplainService: FrontofficeComplainService) { }

  @Post()
  create(@Body() createFrontofficeComplain: FrontofficeComplain) {
    return this.frontofficeComplainService.create(createFrontofficeComplain);
  }


  @Patch(':id')
  update(@Param('id') id: number, @Body() createFrontofficeComplain: FrontofficeComplain) {
    return this.frontofficeComplainService.update(id, createFrontofficeComplain);
  }


  @Delete('/removeFrontofficeComplaint/:id')
  async removeFrontofficeComplaint(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteFrontofficeComplaint = await this.frontofficeComplainService.removeFrontofficeComplaint(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }


  // @Get()
  // findAll() {
  //   return this.frontofficeComplainService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.frontofficeComplainService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createFrontofficeComplain: FrontofficeComplain) {
  //   return this.frontofficeComplainService.update(+id, createFrontofficeComplain);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.frontofficeComplainService.remove(+id);
  // }
}
