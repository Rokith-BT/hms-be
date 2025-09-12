import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AmbulanceListService } from './ambulance_list.service';
import { AmbulanceList } from './entities/ambulance_list.entity';

@Controller('ambulance-list')
export class AmbulanceListController {
  constructor(private readonly ambulanceListService: AmbulanceListService) {}

  @Post()
  create(@Body() createAmbulanceList: AmbulanceList) {
    return this.ambulanceListService.create(createAmbulanceList);
  }


  @Patch('/:id')
  updateAmbulanceList(@Param('id') id: number, @Body()  createAmbulanceList: AmbulanceList) {
    return this.ambulanceListService.updateAmbulanceList(id, createAmbulanceList);
  }


  @Delete('/:id')
  async removeAmbulanceList(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deletedAmbulanceList = await this.ambulanceListService.removeAmbulanceList(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }

  // @Get()
  // findAll() {
  //   return this.ambulanceListService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ambulanceListService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createAmbulanceList: AmbulanceList) {
  //   return this.ambulanceListService.update(+id, createAmbulanceList);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ambulanceListService.remove(+id);
  // }


}
