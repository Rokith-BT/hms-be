import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FrontCmsPage } from "./entities/front_cms_page.entity";


@Injectable()
export class FrontCmsPageService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createFrontCmsPage: FrontCmsPage) {
    try {
      if (createFrontCmsPage.page_type === 'standard') {
        let front_cms_page_id;
        const frontcmspage = await this.connection.query(
          `INSERT into front_cms_pages (
page_type,
is_homepage,
title,
url,
type,
slug,
meta_title,
meta_description,
meta_keyword,
feature_image,
description,
publish_date,
publish,
sidebar,
is_active
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.is_homepage,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
            'page',
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.publish_date,
            0,
          createFrontCmsPage.sidebar,
            'no'
          ],
        );

        front_cms_page_id = frontcmspage.insertId;
        // -------------------------------------//
        await this.dynamicConnection.query(
          `INSERT into front_cms_pages (
page_type,
is_homepage,
title,
url,
type,
slug,
meta_title,
meta_description,
meta_keyword,
feature_image,
description,
publish_date,
publish,
sidebar,
is_active,
hospital_id,
hos_front_cms_pages_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.is_homepage,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
            'page',
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.publish_date,
            0,
          createFrontCmsPage.sidebar,
            'no',
          createFrontCmsPage.hospital_id,
            front_cms_page_id
          ],
        );
      }
      else {
        let front_cms_page_id;
        const frontcmspage = await this.connection.query(
          `INSERT into front_cms_pages (
      page_type,
      is_homepage,
      title,
      url,
      type,
      slug,
      meta_title,
      meta_description,
      meta_keyword,
      feature_image,
      description,
      publish_date,
      publish,
      sidebar,
      is_active
                 ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.is_homepage,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
            'page',
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.publish_date,
            0,
          createFrontCmsPage.sidebar,
            'no'
          ],
        );

        front_cms_page_id = frontcmspage.insertId;
        let front_cms_page_contents_id;

        const frontcmspagecontents = await this.connection.query(
          `INSERT into front_cms_page_contents (
           page_id,
           content_type
                      ) VALUES (?,?)`,
          [front_cms_page_id,
            createFrontCmsPage.page_type
          ],
        );

        front_cms_page_contents_id = frontcmspagecontents.insertId;

        // -------------------------------------//

        let Dyn_fron_cms_pages_id;

        const DynFrontCMSPage = await this.dynamicConnection.query(
          `INSERT into front_cms_pages (
      page_type,
      is_homepage,
      title,
      url,
      type,
      slug,
      meta_title,
      meta_description,
      meta_keyword,
      feature_image,
      description,
      publish_date,
      publish,
      sidebar,
      is_active,
      hospital_id,
      hos_front_cms_pages_id
                 ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.is_homepage,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
            'page',
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.publish_date,
            0,
          createFrontCmsPage.sidebar,
            'no',
          createFrontCmsPage.hospital_id,
            front_cms_page_id
          ],
        );

        Dyn_fron_cms_pages_id = DynFrontCMSPage.insertId;
        await this.dynamicConnection.query(
          `INSERT into front_cms_page_contents (
           page_id,
           content_type,
           hospital_id,
           hos_front_cms_page_contents_id
                      ) VALUES (?,?,?,?)`,
          [Dyn_fron_cms_pages_id,
            createFrontCmsPage.page_type,
            createFrontCmsPage.hospital_id,
            front_cms_page_contents_id
          ],
        );


      }

      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS page details added successfully "
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }






  async removeFrontCMSPage(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM front_cms_pages WHERE id = ?', [id]);
      await this.connection.query('DELETE FROM front_cms_page_contents WHERE page_id = ?', [id]);
      const [GetDyncmspageid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_pages WHERE hos_front_cms_pages_id=? and hospital_id=?',
        [id, hospital_id]
      );
      const Get_Dyn_front_cms_pages_ID = GetDyncmspageid.id;
      await this.dynamicConnection.query('DELETE FROM front_cms_pages WHERE id = ?', [Get_Dyn_front_cms_pages_ID]);
      await this.dynamicConnection.query('DELETE FROM front_cms_page_contents WHERE page_id = ?', [Get_Dyn_front_cms_pages_ID]);
      return [
        {
          status: 'success',
          message: `Front CMS page with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }




  async updateFrontCMSPage(id: number, createFrontCmsPage: FrontCmsPage) {
    try {
      if (createFrontCmsPage.page_type === 'standard') {

        await this.connection.query(
          `update front_cms_pages SET 
      page_type=?,
      title=?,
      url=?,
      slug=?,
      meta_title=?,
      meta_description=?,
      meta_keyword=?,
      feature_image=?,
      description=?,
      sidebar=?
      where id=?`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.sidebar,
            id
          ],
        );

        // -------------------------------------//

        const dynfrontCMSpage = await this.dynamicConnection.query('SELECT id FROM front_cms_pages WHERE hos_front_cms_pages_id=? and hospital_id=?', [id, createFrontCmsPage.hospital_id]);
        const dynfrontCMSpageID = dynfrontCMSpage[0].id;




        await this.dynamicConnection.query(
          `update front_cms_pages SET 
      page_type=?,
      title=?,
      url=?,
      slug=?,
      meta_title=?,
      meta_description=?,
      meta_keyword=?,
      feature_image=?,
      description=?,
      sidebar=?,
      hospital_id=?
      where id=?`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.sidebar,
          createFrontCmsPage.hospital_id,
            dynfrontCMSpageID
          ],
        );
      }

      else {
        await this.connection.query(
          `update front_cms_pages SET 
                page_type=?,
                title=?,
                url=?,
                slug=?,
                meta_title=?,
                meta_description=?,
                meta_keyword=?,
                feature_image=?,
                description=?,
                sidebar=?
                where id=?`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.sidebar,
            id
          ],
        );
        await this.connection.query(
          `update front_cms_page_contents SET 
                        content_type=?
                        where page_id=?`,
          [createFrontCmsPage.page_type,
            id
          ],
        );
        // -------------------------------------//
        const dynfrontCMSpage = await this.dynamicConnection.query('SELECT id FROM front_cms_pages WHERE hos_front_cms_pages_id=? and hospital_id=?', [id, createFrontCmsPage.hospital_id]);
        const dynfrontCMSpageID = dynfrontCMSpage[0].id;
        await this.dynamicConnection.query(
          `update front_cms_pages SET 
                page_type=?,
                title=?,
                url=?,
                slug=?,
                meta_title=?,
                meta_description=?,
                meta_keyword=?,
                feature_image=?,
                description=?,
                sidebar=?,
                hospital_id=?
                where id=?`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.title,
          createFrontCmsPage.url,
          createFrontCmsPage.slug,
          createFrontCmsPage.meta_title,
          createFrontCmsPage.meta_description,
          createFrontCmsPage.meta_keyword,
          createFrontCmsPage.feature_image,
          createFrontCmsPage.description,
          createFrontCmsPage.sidebar,
          createFrontCmsPage.hospital_id,
            dynfrontCMSpageID
          ],
        );

        await this.dynamicConnection.query(
          `update front_cms_page_contents SET 
                        content_type=?,
                        hospital_id=?
                        where page_id=?`,
          [createFrontCmsPage.page_type,
          createFrontCmsPage.hospital_id,
            dynfrontCMSpageID
          ],
        );
      }
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS details updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM front_cms_pages WHERE id = ?', [id])
        }
      }];

    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }

}
