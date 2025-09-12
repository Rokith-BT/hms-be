import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Certificate } from './entities/certificate.entity';

@Injectable()
export class CertificatesService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createCertificate: Certificate) {
    try {
      let certificates_id;
      const certificate = await this.connection.query(
        `INSERT into certificates (
certificate_name,
certificate_text,
left_header,
center_header,
right_header,
left_footer,
right_footer,
center_footer,
background_image,
created_for,
status,
header_height,
content_height,
footer_height,
content_width,
enable_patient_image,
enable_image_height
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createCertificate.certificate_name,
        createCertificate.certificate_text,
        createCertificate.left_header,
        createCertificate.center_header,
        createCertificate.right_header,
        createCertificate.left_footer,
        createCertificate.right_footer,
        createCertificate.center_footer,
        createCertificate.background_image,
        createCertificate.created_for,
        createCertificate.status,
        createCertificate.header_height,
        createCertificate.content_height,
        createCertificate.footer_height,
        createCertificate.content_width,
        createCertificate.enable_patient_image,
        createCertificate.enable_image_height
        ],
      );
      certificates_id = certificate.insertId;

      await this.dynamicConnection.query(
        `INSERT into certificates (
certificate_name,
certificate_text,
left_header,
center_header,
right_header,
left_footer,
right_footer,
center_footer,
background_image,
created_for,
status,
header_height,
content_height,
footer_height,
content_width,
enable_patient_image,
enable_image_height,
hospital_id,
hos_certificates_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [createCertificate.certificate_name,
        createCertificate.certificate_text,
        createCertificate.left_header,
        createCertificate.center_header,
        createCertificate.right_header,
        createCertificate.left_footer,
        createCertificate.right_footer,
        createCertificate.center_footer,
        createCertificate.background_image,
        createCertificate.created_for,
        createCertificate.status,
        createCertificate.header_height,
        createCertificate.content_height,
        createCertificate.footer_height,
        createCertificate.content_width,
        createCertificate.enable_patient_image,
        createCertificate.enable_image_height,
        createCertificate.hospital_id,
          certificates_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Certificate details added successfully ",
          "Certificates_values": await this.connection.query('SELECT * FROM certificates where id = ?', [certificates_id])
        }
      }];

    } catch (error) {
      console.error('Error inserting data:', error);
    }

  }


  async updateCertificates(id: number, createCertificate: Certificate) {
    try {
      const fromDate = new Date()
      const timestamp = fromDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      await this.connection.query(`update certificates SET
certificate_name=?,
certificate_text=?,
left_header=?,
center_header=?,
right_header=?,
left_footer=?,
right_footer=?,
center_footer=?,
background_image=?,
created_for=?,
status=?,
header_height=?,
content_height=?,
footer_height=?,
content_width=?,
enable_patient_image=?,
enable_image_height=?,
updated_at=?
where id=?`,
        [
          createCertificate.certificate_name,
          createCertificate.certificate_text,
          createCertificate.left_header,
          createCertificate.center_header,
          createCertificate.right_header,
          createCertificate.left_footer,
          createCertificate.right_footer,
          createCertificate.center_footer,
          createCertificate.background_image,
          createCertificate.created_for,
          createCertificate.status,
          createCertificate.header_height,
          createCertificate.content_height,
          createCertificate.footer_height,
          createCertificate.content_width,
          createCertificate.enable_patient_image,
          createCertificate.enable_image_height,
          timestamp,
          id
        ],
      )




      const dyncertificate = await this.dynamicConnection.query('SELECT id FROM certificates WHERE hos_certificates_id=? and hospital_id=?', [id, createCertificate.hospital_id]);
      const dynCertificateID = dyncertificate[0].id;


      await this.dynamicConnection.query(
        `update certificates SET
certificate_name=?,
certificate_text=?,
left_header=?,
center_header=?,
right_header=?,
left_footer=?,
right_footer=?,
center_footer=?,
background_image=?,
created_for=?,
status=?,
header_height=?,
content_height=?,
footer_height=?,
content_width=?,
enable_patient_image=?,
enable_image_height=?,
updated_at=?,
hospital_id=?
where id=?`,
        [
          createCertificate.certificate_name,
          createCertificate.certificate_text,
          createCertificate.left_header,
          createCertificate.center_header,
          createCertificate.right_header,
          createCertificate.left_footer,
          createCertificate.right_footer,
          createCertificate.center_footer,
          createCertificate.background_image,
          createCertificate.created_for,
          createCertificate.status,
          createCertificate.header_height,
          createCertificate.content_height,
          createCertificate.footer_height,
          createCertificate.content_width,
          createCertificate.enable_patient_image,
          createCertificate.enable_image_height,
          timestamp,
          createCertificate.hospital_id,
          dynCertificateID
        ],
      )


      return [{
        "data ": {
          status: "success",
          "messege": "Certificate details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM certificates WHERE id = ?', [id])
        }
      }];


    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }


  async removeCertificates(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM certificates WHERE id = ?', [id]);
      const [GetDynCertificates] = await this.dynamicConnection.query(
        'SELECT id FROM certificates WHERE hos_certificates_id=? and hospital_id=?',
        [id, hospital_id]
      );

      const GetDynCertificatesID = GetDynCertificates.id;
      await this.dynamicConnection.query('DELETE FROM certificates WHERE id = ?', [GetDynCertificatesID]);
      return [
        {
          status: 'success',
          message: `Certificates with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }
}
