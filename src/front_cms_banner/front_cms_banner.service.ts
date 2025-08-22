import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FrontCmsBanner } from "./entities/front_cms_banner.entity";


@Injectable()
export class FrontCmsBannerService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createFrontCmsBanner: FrontCmsBanner) {
    try {
      let cms_program_id;
      const cmsPrograms = await this.connection.query(
        `INSERT into front_cms_programs (
type,
title,
is_active,
publish,
sidebar
         ) VALUES (?,?,?,?,?)`,
        ['banner',
          'Banner Images',
          'no',
          0,
          0
        ],
      );

      cms_program_id = cmsPrograms.insertId;
      let cms_program_photos_id;

      const cmsProgramPhotos = await this.connection.query(
        `INSERT into front_cms_program_photos (
     program_id,
     media_gallery_id
              ) VALUES (?,?)`,
        [cms_program_id,
          createFrontCmsBanner.media_gallery_id
        ],
      );
      cms_program_photos_id = cmsProgramPhotos.insertId;

      // -------------------------------------//

      let Dyn_CMS_program_id;

      const Dyn_CMS_programs = await this.dynamicConnection.query(
        `INSERT into front_cms_programs (
type,
title,
is_active,
publish,
sidebar,
hospital_id,
hos_front_cms_programs_id
         ) VALUES (?,?,?,?,?,?,?)`,
        ['banner',
          'Banner Images',
          'no',
          0,
          0,
          createFrontCmsBanner.hospital_id,
          cms_program_id
        ],
      );

      Dyn_CMS_program_id = Dyn_CMS_programs.insertId;

      const [GetDyncmsmediagalleryid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_media_gallery WHERE hos_front_cms_media_gallery_id=? and hospital_id=?',
        [createFrontCmsBanner.media_gallery_id, createFrontCmsBanner.hospital_id]
      );
      const Get_Dyn_front_cms_media_gallery_ID = GetDyncmsmediagalleryid.id;
      await this.dynamicConnection.query(
        `INSERT into front_cms_program_photos (
     program_id,
     media_gallery_id,
     hospital_id,
     hos_front_cms_program_photos_id
              ) VALUES (?,?,?,?)`,
        [Dyn_CMS_program_id,
          Get_Dyn_front_cms_media_gallery_ID,
          createFrontCmsBanner.hospital_id,
          cms_program_photos_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS banner details added successfully ",
          "banner_values": await this.connection.query('SELECT * FROM front_cms_programs where id = ?', [cms_program_id])
        }
      }];
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }


  async removeFrontCMSBanner(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM front_cms_program_photos WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM front_cms_program_photos WHERE hospital_id = ? and hos_front_cms_program_photos_id=?', [hospital_id, id]);
      return [
        {
          status: 'success',
          message: `Front CMS banner with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }


  async createbanner(createFrontCmsBanner: FrontCmsBanner) {
    try {
      let cms_program_photos_id;
      const cmsProgramPhotos = await this.connection.query(
        `INSERT into front_cms_program_photos (
       program_id,
       media_gallery_id
                ) VALUES (?,?)`,
        [createFrontCmsBanner.program_id,
        createFrontCmsBanner.media_gallery_id
        ],
      );
      cms_program_photos_id = cmsProgramPhotos.insertId;

      // -------------------------------------//

      const [GetDyncmsmediagalleryid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_media_gallery WHERE hos_front_cms_media_gallery_id=? and hospital_id=?',
        [createFrontCmsBanner.media_gallery_id, createFrontCmsBanner.hospital_id]
      );
      const Get_Dyn_front_cms_media_gallery_ID = GetDyncmsmediagalleryid.id;
      const [GetDyncmsprogramid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?',
        [createFrontCmsBanner.program_id, createFrontCmsBanner.hospital_id]
      );
      const Get_Dyn_front_cms_program_ID = GetDyncmsprogramid.id;

      await this.dynamicConnection.query(
        `INSERT into front_cms_program_photos (
       program_id,
       media_gallery_id,
       hospital_id,
       hos_front_cms_program_photos_id
                ) VALUES (?,?,?,?)`,
        [Get_Dyn_front_cms_program_ID,
          Get_Dyn_front_cms_media_gallery_ID,
          createFrontCmsBanner.hospital_id,
          cms_program_photos_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS banner details added successfully ",
          "banner_values": await this.connection.query('SELECT * FROM front_cms_program_photos where id = ?', [cms_program_photos_id])
        }
      }];

    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
}
