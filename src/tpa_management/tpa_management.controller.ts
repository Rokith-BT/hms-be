import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TpaManagementService } from './tpa_management.service';
import { TpaManagement } from './entities/tpa_management.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('tpa-management')
export class TpaManagementController {
  constructor(private readonly tpaManagementService: TpaManagementService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() tpa_managementEntity: TpaManagement) {
    return this.tpaManagementService.create(tpa_managementEntity);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.tpaManagementService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tpaManagementService.findone(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() tpa_managementEntity: TpaManagement) {
    return this.tpaManagementService.update(id, tpa_managementEntity);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('hos_id') hos_id: number) {
    return this.tpaManagementService.remove(id, hos_id);
  }
}
