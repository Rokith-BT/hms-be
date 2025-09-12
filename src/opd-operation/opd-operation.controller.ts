import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OpdOperationService } from './opd-operation.service';
import { OpdOperation } from './entities/opd-operation.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('opd-operation')
export class OpdOperationController {
  constructor(private readonly opdOperationService: OpdOperationService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOperationopd: OpdOperation) {
    return this.opdOperationService.create(createOperationopd);
  }

  @UseGuards(AuthGuard)
  @Get()
  findALL() {
    return this.opdOperationService.findALL();
  }
  @UseGuards(AuthGuard)
  @Get('/operations')
  findone(@Query(`opd_details_id`) opd_details_id: number, @Query(`operation_theatre_id`) operation_theatre_id: number) {
    return this.opdOperationService.findone(opd_details_id, operation_theatre_id);
  }

  @UseGuards(AuthGuard)
  @Get('/OperationByOPDid/:id')
  findIPDOperSearch(@Param('id') id: number, @Query('search') search: string) {
    return this.opdOperationService.findOPDOperSearch(id, search);
  }


  @UseGuards(AuthGuard)
  @Get('/operationName/:id')
  findopernamebycategory(@Param('id') id: number) {
    return this.opdOperationService.findopernamebycategory(id);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() createOperationopd: OpdOperation) {
    return this.opdOperationService.update(id, createOperationopd);
  }

  @UseGuards(AuthGuard)
  @Delete('/deleteOperation/:id')
  async removeNurseNoteComment(@Param('id') id: number, @Query('Hospital_id') Hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteOperation = await this.opdOperationService.remove(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }

}