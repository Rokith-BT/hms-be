import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetupPatientNewPatientService } from './setup-patient-new_patient.service';
import { SetupPatientNewPatient } from './entities/setup-patient-new_patient.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('setup-patient-new-patient')
export class SetupPatientNewPatientController {
  constructor(
    private readonly setupPatientNewPatientService: SetupPatientNewPatientService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() new_patientEntity: SetupPatientNewPatient) {
    return this.setupPatientNewPatientService.create(new_patientEntity);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.setupPatientNewPatientService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setupPatientNewPatientService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() new_patientEntity: SetupPatientNewPatient,
  ) {
    return this.setupPatientNewPatientService.update(id, new_patientEntity);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.setupPatientNewPatientService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Get('/setupNewPatient/:search')
  setupNewPatient(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupPatientNewPatientService.setupNewPatient(search);
  }

  @UseGuards(AuthGuard)
  @Get('/patient/disabled')
  disablePatList() {
    return this.setupPatientNewPatientService.disablePatList();
  }
  @UseGuards(AuthGuard)
  @Get('/SetupDisabledPatient/:search')
  SetupDisabledPatient(@Param('search') search: string) {
    console.log(search, 'zzzzzz');

    return this.setupPatientNewPatientService.SetupDisabledPatient(search);
  }

  @UseGuards(AuthGuard)
  @Get('/checkPatient/WithMobileNo')
  checkOldPatient(@Query('mobile') search: string) {
    console.log(search, 'zzzzzz');
    return this.setupPatientNewPatientService.checkOldPatient(search);
  }
  @UseGuards(AuthGuard)
  @Get('/getPatient/WithAayushId')
  getPatientDetailsWithAayush(@Query('aayush_unique_id') search: string) {
    console.log(search, 'zzzzzz');
    return this.setupPatientNewPatientService.getPatientDetailsWithAayush(
      search,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpatient')
  async findAllDesig(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string, // <-- Capital "D"
    @Query('toDate') toDate?: string, // <-- Capital "D"
  ) {
    try {
      const final_output =
        await this.setupPatientNewPatientService.findallpatients(
          limit || 10,
          page || 1,
          search || '',
          fromDate || '',
          toDate || '',
        );

      if (final_output.details.length > 0) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output.details,
          total: final_output.total,
          limit: final_output.limit,
          totalPages: Math.ceil(final_output.total / final_output.limit),
        };
      }

      return this.setupPatientNewPatientService.findallpatients(
        limit,
        page,
        search,
        fromDate,
        toDate,
      );
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('/v2/getAllpatient/:id')
  async findOneDesig(@Param('id') id: number) {
    try {
      const final_output =
        await this.setupPatientNewPatientService.patient_info(id);
      if (final_output) {
        return {
          status_code: process.env.SUCCESS_STATUS_CODE,
          status: process.env.SUCCESS_STATUS,
          message: process.env.SUCCESS_MESSAGE,
          data: final_output,
        };
      } else {
        return {
          status_code: process.env.ERROR_STATUS_CODE,
          status: process.env.ERROR_STATUS,
          message: process.env.ERROR_MESSAGE,
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

  // @UseGuards(AuthGuard)
  @Get('/v3/getAllpatient')
  async findAllDesigV3(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    try {
      const final_output =
        await this.setupPatientNewPatientService.V3findallpatients(
          limit || 10,
          page || 1,
          search || '',
          fromDate || '',
          toDate || '',
        );
      return final_output;
      // if (final_output.details.length > 0) {
      //   return {
      //     status_code: process.env.SUCCESS_STATUS_CODE,
      //     status: process.env.SUCCESS_STATUS,
      //     message: process.env.SUCCESS_MESSAGE,
      //     data: final_output.details,
      //     total: final_output.total,
      //     limit: final_output.limit,
      //     totalPages: Math.ceil(final_output.total / final_output.limit),
      //   };
      // }

      // return this.setupPatientNewPatientService.findallpatients(
      //   limit,
      //   page,
      //   search,
      //   fromDate,
      //   toDate,
      // );
    } catch (error) {
      return {
        status_code: process.env.ERROR_STATUS_CODE,
        status: process.env.ERROR_STATUS,
        message: process.env.ERROR_MESSAGE,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('unique/:id')
  findid(@Param('id') id: string) {
    return this.setupPatientNewPatientService.findPATIENT_ID(id);
  }
}
