import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AmbulanceCallService } from './ambulance_call.service';
import { AmbulanceCall } from './entities/ambulance_call.entity';


@Controller('ambulance-call')
export class AmbulanceCallController {
  constructor(private readonly ambulanceCallService: AmbulanceCallService) {}

  @Post()
  create(@Body() createAmbulanceCall: AmbulanceCall) {
    return this.ambulanceCallService.create(createAmbulanceCall);
  }


  @Patch('/:id')
  updateAmbulanceCall(@Param('id') id: number, @Body()  createAmbulanceCall: AmbulanceCall) {
    return this.ambulanceCallService.updateAmbulanceCall(id, createAmbulanceCall);
  }

  @Delete('/:id')
  async removeAmbulanceCall(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteAmbulanceCall = await this.ambulanceCallService.removeAmbulanceCall(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }


    @Delete('/deleteAmbulancePayment/:id')
    async deleteAmbulancePayment(@Param('id') id: number,@Query('Hospital_id') Hospital_id: number): Promise<{ status: string; message: string }> {
      
        const removeAmbulancePayment = await this.ambulanceCallService.deleteAmbulancePayment(id,Hospital_id);
        return {
          status: 'success',
          message: `id: ${id} deleted successfully`,
        };
  
  
      }



      @Post('/AddAmbulancePayment')
      AddAmbulancePayment(@Body() createAmbulanceCall: AmbulanceCall) {
    return this.ambulanceCallService.AddAmbulancePayment(createAmbulanceCall);
  }

  // @Get()
  // findAll() {
  //   return this.ambulanceCallService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ambulanceCallService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createAmbulanceCall: AmbulanceCall) {
  //   return this.ambulanceCallService.update(+id, createAmbulanceCall);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ambulanceCallService.remove(+id);
  // }

}
