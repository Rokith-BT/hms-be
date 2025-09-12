import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { VisitorBookService } from './visitor_book.service';
import { VisitorBook } from './entities/visitor_book.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('visitor-book')
export class VisitorBookController {
  constructor(private readonly visitorBookService: VisitorBookService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createVisitorBook: VisitorBook) {
    return this.visitorBookService.create(createVisitorBook);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() createVisitorBook: VisitorBook) {
    return this.visitorBookService.update(id, createVisitorBook);
  }
  @UseGuards(AuthGuard)
  @Delete('/removeFrontofficeVisitors/:id')
  async removeFrontofficeVisitors(@Param('id') id: number, @Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {

    const deleteFrontoffiveVisitors = await this.visitorBookService.removeFrontofficeVisitors(id, hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };


  }
}
