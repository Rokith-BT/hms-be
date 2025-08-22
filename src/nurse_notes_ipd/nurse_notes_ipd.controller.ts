import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards
} from '@nestjs/common';
import { NurseNotesIpd } from './entities/nurse_notes_ipd.entity';
import { NurseNotesIpdService } from './nurse_notes_ipd.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('nurse-notes-ipd')
export class NurseNotesIpdController {
  constructor(private readonly nurseNotesIpdService: NurseNotesIpdService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() NurseNotesIpdmodule: NurseNotesIpd) {
    return this.nurseNotesIpdService.create(NurseNotesIpdmodule);
  }
  @UseGuards(AuthGuard)
  @Post('/comment')
  createNurseComment(@Body() NurseNotesCommentIpdmodule: NurseNotesIpd) {
    return this.nurseNotesIpdService.createNurseComment(
      NurseNotesCommentIpdmodule,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async removeNurseNote(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.nurseNotesIpdService.remove(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Delete('/deleteComment/:id')
  async removeNurseNoteComment(
    @Param('id') id: number,
    @Query('Hospital_id') Hospital_id: number,
  ): Promise<{ status: string; message: string }> {
    await this.nurseNotesIpdService.removeComment(id, Hospital_id);
    return {
      status: 'success',
      message: `id: ${id} deleted successfully`,
    };
  }
  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.nurseNotesIpdService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: number, @Body() NurseNotesIpdmodule: NurseNotesIpd) {
    return this.nurseNotesIpdService.update(id, NurseNotesIpdmodule);
  }
  @UseGuards(AuthGuard)
  @Get('/v2/get_nurse_notes_ipd_details')
  async findNurseNotesIpdDetails(
    @Query('ipd_id') ipd_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.nurseNotesIpdService.findNurseNotesIpdDetails(
        ipd_id,
        search,
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }


  @UseGuards(AuthGuard)
  @Get('/v3/get_nurse_notes_ipd_details')
  async findNurseNotesIpdDetail(
    @Query('ipd_id') ipd_id: number,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    try {
      if (!ipd_id) {
        return {
          status_code: process.env.BAD_REQUEST_CODE,
          status: process.env.BAD_REQUEST_STATUS,
          message: 'IPD ID is required',
        };
      }

      const final_out = await this.nurseNotesIpdService.findNurseNotesIpdDetail(
        ipd_id,
        search,
        limit || 10,
        page || 1,
      );

      if (final_out.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_out.details,
          total: final_out.total,
        };
      } else {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.DATA_NOT_FOUND,
          data: [],
          total: 0,
        };
      }
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }



}
