import { Controller, Get, Post, Body, Patch, Param, Delete , Query, UseGuards } from '@nestjs/common';
import { MediaManagerService } from './media_manager.service';
import {MediaManager} from './entities/media_manager.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('media-manager')
export class MediaManagerController {
  constructor(private readonly mediaManagerService: MediaManagerService) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() createMediaManager: MediaManager) {
    return this.mediaManagerService.create(createMediaManager);
  }

@UseGuards(AuthGuard)
  @Delete('/removeMediaManager/:id')
  async removeFrontCMSMediaManager(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteCMSmediaManager = await this.mediaManagerService.removeFrontCMSMediaManager(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }

  // @Get()
  // findAll() {
  //   return this.mediaManagerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.mediaManagerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createMediaManager: MediaManager) {
  //   return this.mediaManagerService.update(+id, createMediaManager);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.mediaManagerService.remove(+id);
  // }
}
