import { Controller, Get, Post, Body, Patch, Param, Delete , Query, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import {Certificate} from './entities/certificate.entity'
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}
@UseGuards(AuthGuard)
  @Post()
  create(@Body() createCertificate: Certificate) {
    return this.certificatesService.create(createCertificate);
  }

@UseGuards(AuthGuard)
  @Patch('/:id')
  updateCertificates(@Param('id') id: number, @Body()  createCertificate: Certificate) {
    return this.certificatesService.updateCertificates(id, createCertificate);
  }

@UseGuards(AuthGuard)
  @Delete('/:id')
  async removeCertificates(@Param('id') id: number,@Query('hospital_id') hospital_id: number): Promise<{ status: string; message: string }> {
    
      const deleteCertificates = await this.certificatesService.removeCertificates(id,hospital_id);
      return {
        status: 'success',
        message: `id: ${id} deleted successfully`,
      };


    }



  // @Get()
  // findAll() {
  //   return this.certificatesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.certificatesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() createCertificate: Certificate) {
  //   return this.certificatesService.update(+id, createCertificate);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.certificatesService.remove(+id);
  // }
}
