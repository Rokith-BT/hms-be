import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PostalReceiveDispatchService } from './postal_receive_dispatch.service';
import { PostalReceiveDispatch } from './entities/postal_receive_dispatch.entity';

@Controller('postal-receive-dispatch')
export class PostalReceiveDispatchController {
  constructor(private readonly postalReceiveDispatchService: PostalReceiveDispatchService) {}

  @Post()
  create(@Body() createPostalReceiveDispatch: PostalReceiveDispatch) {
    return this.postalReceiveDispatchService.create(createPostalReceiveDispatch);
  }


  @Patch(':id')
  updateDispatch(@Param('id') id:number, @Body() createPostalReceiveDispatch: PostalReceiveDispatch) {
    return this.postalReceiveDispatchService.updateDispatch(id, createPostalReceiveDispatch);
  }


  @Delete('/removeFrontofficePostalDispatch/:id')
  async removeFrontofficePostalDispatch(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteFrontofficePostalDispatch = await this.postalReceiveDispatchService.removeFrontofficePostalDispatch(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }



    @Post('/postalReceive')
    createReceive(@Body() createPostalReceiveDispatch: PostalReceiveDispatch) {
      return this.postalReceiveDispatchService.createReceive(createPostalReceiveDispatch);
    }


    @Patch('/updateReceive/:id')
    updateReceive(@Param('id') id:number, @Body() createPostalReceiveDispatch: PostalReceiveDispatch) {
      return this.postalReceiveDispatchService.updateReceive(id, createPostalReceiveDispatch);
    }



    @Delete('/removeFrontofficePostalReceive/:id')
    async removeFrontofficePostalReceive(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
      
        const deleteFrontofficePostalReceive = await this.postalReceiveDispatchService.removeFrontofficePostalReceive(id,hospital_id);
        return {
          status: 'success',
          message: `id: ${id} deleted successfully`,
        };
  
  
      }



  // @Get()
  // findAll() {
  //   return this.postalReceiveDispatchService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postalReceiveDispatchService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createPostalReceiveDispatch: PostalReceiveDispatch) {
  //   return this.postalReceiveDispatchService.update(+id, createPostalReceiveDispatch);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postalReceiveDispatchService.remove(+id);
  // }


}
