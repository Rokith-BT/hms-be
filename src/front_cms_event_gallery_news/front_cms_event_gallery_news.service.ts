import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FrontCmsEventGalleryNew } from "./entities/front_cms_event_gallery_new.entity";



@Injectable()
export class FrontCmsEventGalleryNewsService {
  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }


  async create(createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    try {
      const eventDate = new Date();
      let cms_event_id;

      const cmsEvent = await this.connection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
event_start,
event_end,
event_venue,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['events',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.event_start,
          createFrontCmsEventGalleryNew.event_end,
          createFrontCmsEventGalleryNew.event_venue,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar
        ],
      );

      cms_event_id = cmsEvent.insertId;
      // -------------------------------------//
      await this.dynamicConnection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
event_start,
event_end,
event_venue,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar,
hospital_id,
hos_front_cms_programs_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['events',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.event_start,
          createFrontCmsEventGalleryNew.event_end,
          createFrontCmsEventGalleryNew.event_venue,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar,
          createFrontCmsEventGalleryNew.hospital_id,
          cms_event_id
        ],
      );

      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS event details added successfully ",
          "Event_values": await this.connection.query('SELECT * FROM front_cms_programs where id = ?', [cms_event_id])
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }




  async createNews(createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {

    try {

      const eventDate = new Date();
      let cms_news_id;
      const cmsNews = await this.connection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['notice',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar
        ],
      );

      cms_news_id = cmsNews.insertId;
      // -------------------------------------//

      await this.dynamicConnection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar,
hospital_id,
hos_front_cms_programs_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['notice',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar,
          createFrontCmsEventGalleryNew.hospital_id,
          cms_news_id
        ],
      );

      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS news details added successfully ",
          "News_values": await this.connection.query('SELECT * FROM front_cms_programs where id = ?', [cms_news_id])
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }



  async createGallery(createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    try {

      const eventDate = new Date();
      let cms_program_id;
      const cmsPrograms = await this.connection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['gallery',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar
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
          createFrontCmsEventGalleryNew.media_gallery_id
        ],
      );

      cms_program_photos_id = cmsProgramPhotos.insertId;

      // -------------------------------------//


      await this.dynamicConnection.query(
        `INSERT into front_cms_programs (
type,
slug,
url,
title,
date,
description,
is_active, 
meta_title,
meta_description,
meta_keyword,
feature_image,
publish,
sidebar,
hospital_id,
hos_front_cms_programs_id
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ['gallery',
          createFrontCmsEventGalleryNew.slug,
          createFrontCmsEventGalleryNew.url,
          createFrontCmsEventGalleryNew.title,
          eventDate,
          createFrontCmsEventGalleryNew.description,
          'no',
          createFrontCmsEventGalleryNew.meta_title,
          createFrontCmsEventGalleryNew.meta_description,
          createFrontCmsEventGalleryNew.meta_keyword,
          createFrontCmsEventGalleryNew.feature_image,
          0,
          createFrontCmsEventGalleryNew.sidebar,
          createFrontCmsEventGalleryNew.hospital_id,
          cms_program_id
        ],
      );
      const [GetDyncmsmediagalleryid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_media_gallery WHERE hos_front_cms_media_gallery_id=? and hospital_id=?',
        [createFrontCmsEventGalleryNew.media_gallery_id, createFrontCmsEventGalleryNew.hospital_id]
      );
      const Get_Dyn_front_cms_media_gallery_ID = GetDyncmsmediagalleryid.id;
      await this.dynamicConnection.query(
        `INSERT into front_cms_program_photos (
     program_id,
     media_gallery_id,
     hospital_id,
     hos_front_cms_program_photos_id
              ) VALUES (?,?,?,?)`,
        [cms_program_id,
          Get_Dyn_front_cms_media_gallery_ID,
          createFrontCmsEventGalleryNew.hospital_id,
          cms_program_photos_id
        ],
      );

      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS gallery details added successfully ",
          "gallery_values": await this.connection.query('SELECT * FROM front_cms_programs where id = ?', [cms_program_id])
        }
      }];

    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }



  async removeFrontCMSEvent(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM front_cms_programs WHERE id = ?', [id]);
      const [GetDyncmsprogramsid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const Get_Dyn_front_cms_programs_ID = GetDyncmsprogramsid.id;

      await this.dynamicConnection.query('DELETE FROM front_cms_programs WHERE id = ?', [Get_Dyn_front_cms_programs_ID]);
      return [
        {
          status: 'success',
          message: `Front CMS event with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async removeFrontCMSNews(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM front_cms_programs WHERE id = ?', [id]);

      const [GetDyncmsprogramsid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const Get_Dyn_front_cms_programs_ID = GetDyncmsprogramsid.id;

      await this.dynamicConnection.query('DELETE FROM front_cms_programs WHERE id = ?', [Get_Dyn_front_cms_programs_ID]);

      return [
        {
          status: 'success',
          message: `Front CMS news with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async removeFrontCMSGallery(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM front_cms_programs WHERE id = ?', [id]);
      await this.connection.query('DELETE FROM front_cms_program_photos WHERE program_id = ?', [id]);
      const [GetDyncmsprogramsid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const Get_Dyn_front_cms_programs_ID = GetDyncmsprogramsid.id;
      await this.dynamicConnection.query('DELETE FROM front_cms_programs WHERE id = ?', [Get_Dyn_front_cms_programs_ID]);
      await this.dynamicConnection.query('DELETE FROM front_cms_program_photos WHERE program_id = ?', [Get_Dyn_front_cms_programs_ID]);

      return [
        {
          status: 'success',
          message: `Front CMS gallery with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async updateFrontCMSevent(id: number, createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {


    try {
      const eventDate = new Date();
      await this.connection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          event_start=?,
          event_end=?,
          event_venue=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.event_start,
        createFrontCmsEventGalleryNew.event_end,
        createFrontCmsEventGalleryNew.event_venue,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
          id
        ],
      );
      // -------------------------------------//

      const dynfrontCMSprograms = await this.dynamicConnection.query('SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?', [id, createFrontCmsEventGalleryNew.hospital_id]);
      const dynfrontCMSprogramsID = dynfrontCMSprograms[0].id;

      await this.dynamicConnection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          event_start=?,
          event_end=?,
          event_venue=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?,
          hospital_id=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.event_start,
        createFrontCmsEventGalleryNew.event_end,
        createFrontCmsEventGalleryNew.event_venue,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
        createFrontCmsEventGalleryNew.hospital_id,
          dynfrontCMSprogramsID
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS event updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM front_cms_programs WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }

  async updateFrontCMSNews(id: number, createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    try {
      const eventDate = new Date();

      await this.connection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
          id
        ],
      );
      const dynfrontCMSprograms = await this.dynamicConnection.query('SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?', [id, createFrontCmsEventGalleryNew.hospital_id]);
      const dynfrontCMSprogramsID = dynfrontCMSprograms[0].id;
      await this.dynamicConnection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?,
          hospital_id=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
        createFrontCmsEventGalleryNew.hospital_id,
          dynfrontCMSprogramsID
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS news updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM front_cms_programs WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async updateFrontCMSGallery(id: number, createFrontCmsEventGalleryNew: FrontCmsEventGalleryNew) {
    try {
      const eventDate = new Date();
      await this.connection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
          id
        ],
      );
      await this.connection.query(
        `update front_cms_program_photos SET 
                  media_gallery_id=?
                  where program_id=?`,
        [createFrontCmsEventGalleryNew.media_gallery_id,
          id
        ],
      );

      const dynfrontCMSprograms = await this.dynamicConnection.query('SELECT id FROM front_cms_programs WHERE hos_front_cms_programs_id=? and hospital_id=?', [id, createFrontCmsEventGalleryNew.hospital_id]);
      const dynfrontCMSprogramsID = dynfrontCMSprograms[0].id;

      await this.dynamicConnection.query(
        `update front_cms_programs SET 
          slug=?,
          url=?,
          title=?,
          date=?,
          description=?,
          meta_title=?,
          meta_description=?,
          meta_keyword=?,
          feature_image=?,
          sidebar=?,
          hospital_id=?
          where id=?`,
        [createFrontCmsEventGalleryNew.slug,
        createFrontCmsEventGalleryNew.url,
        createFrontCmsEventGalleryNew.title,
          eventDate,
        createFrontCmsEventGalleryNew.description,
        createFrontCmsEventGalleryNew.meta_title,
        createFrontCmsEventGalleryNew.meta_description,
        createFrontCmsEventGalleryNew.meta_keyword,
        createFrontCmsEventGalleryNew.feature_image,
        createFrontCmsEventGalleryNew.sidebar,
        createFrontCmsEventGalleryNew.hospital_id,
          dynfrontCMSprogramsID
        ],
      );
      const [GetDyncmsmediagalleryid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_media_gallery WHERE hos_front_cms_media_gallery_id=? and hospital_id=?',
        [createFrontCmsEventGalleryNew.media_gallery_id, createFrontCmsEventGalleryNew.hospital_id]
      );
      const Get_Dyn_front_cms_media_gallery_ID = GetDyncmsmediagalleryid.id;

      await this.dynamicConnection.query(
        `update front_cms_program_photos SET 
                  media_gallery_id=?,
                  hospital_id=?
                  where program_id=?`,
        [Get_Dyn_front_cms_media_gallery_ID,
          createFrontCmsEventGalleryNew.hospital_id,
          dynfrontCMSprogramsID
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS gallery updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM front_cms_programs WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }


}
