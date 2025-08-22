import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FrontCmsMenu } from "./entities/front_cms_menu.entity";

@Injectable()
export class FrontCmsMenuService {


  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }
  async create(createFrontCmsMenu: FrontCmsMenu) {
    try {
      let cms_menu_id;
      const cmsMenus = await this.connection.query(
        `INSERT into front_cms_menus (
menu,
slug,
description,
open_new_tab,
publish,
content_type,
is_active
         ) VALUES (?,?,?,?,?,?,?)`,
        [createFrontCmsMenu.menu,
        createFrontCmsMenu.slug,
        createFrontCmsMenu.description,
          0,
          0,
          'manual',
          'no'
        ],
      );
      cms_menu_id = cmsMenus.insertId;
      // ------------------------------------//
      await this.dynamicConnection.query(
        `INSERT into front_cms_menus (
menu,
slug,
description,
open_new_tab,
publish,
content_type,
is_active,
hospital_id,
hos_front_cms_menus_id
         ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [createFrontCmsMenu.menu,
        createFrontCmsMenu.slug,
        createFrontCmsMenu.description,
          0,
          0,
          'manual',
          'no',
        createFrontCmsMenu.hospital_id,
          cms_menu_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS menu details added successfully ",
          "menu_values": await this.connection.query('SELECT * FROM front_cms_menus where id = ?', [cms_menu_id])
        }
      }];


    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async removeFrontCMSMenu(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM front_cms_menus WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM front_cms_menus WHERE hospital_id = ? and hos_front_cms_menus_id=?', [hospital_id, id]);
      return [
        {
          status: 'success',
          message: `Front CMS menu with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async createMenuItems(createFrontCmsMenu: FrontCmsMenu) {
    try {
      let cms_menu_items_id;
      const cmsMenusItem = await this.connection.query(
        `INSERT into front_cms_menu_items (
  menu_id,
  menu,
  page_id,
  parent_id,
  ext_url,
  open_new_tab,
  ext_url_link,
  slug,
  publish,
  is_active
           ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [createFrontCmsMenu.menu_id,
        createFrontCmsMenu.menu,
        createFrontCmsMenu.page_id,
          0,
        createFrontCmsMenu.ext_url,
        createFrontCmsMenu.open_new_tab,
        createFrontCmsMenu.ext_url_link,
        createFrontCmsMenu.slug,
          0,
          'no'
        ],
      );

      cms_menu_items_id = cmsMenusItem.insertId;
      const [GetDyncmsmenuid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_menus WHERE hos_front_cms_menus_id=? and hospital_id=?',
        [createFrontCmsMenu.menu_id, createFrontCmsMenu.hospital_id]
      );
      const Get_Dyn_front_cms_menu_ID = GetDyncmsmenuid.id;
      const [GetDyncmspageid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_pages WHERE hos_front_cms_pages_id=? and hospital_id=?',
        [createFrontCmsMenu.page_id, createFrontCmsMenu.hospital_id]
      );
      const Get_Dyn_front_cms_page_ID = GetDyncmspageid.id;
      // -------------------------------------//
      await this.dynamicConnection.query(
        `INSERT into front_cms_menu_items (
 menu_id,
  menu,
  page_id,
  parent_id,
  ext_url,
  open_new_tab,
  ext_url_link,
  slug,
  publish,
  is_active,
  hospital_id,
  hos_front_cms_menu_items_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [Get_Dyn_front_cms_menu_ID,
          createFrontCmsMenu.menu,
          Get_Dyn_front_cms_page_ID,
          0,
          createFrontCmsMenu.ext_url,
          createFrontCmsMenu.open_new_tab,
          createFrontCmsMenu.ext_url_link,
          createFrontCmsMenu.slug,
          0,
          'no',
          createFrontCmsMenu.hospital_id,
          cms_menu_items_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS menu item details added successfully ",
          "menu_item_values": await this.connection.query('SELECT * FROM front_cms_menu_items where id = ?', [cms_menu_items_id])
        }
      }];

    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async updateFrontCMSMenuItems(id: number, createFrontCmsMenu: FrontCmsMenu) {
    try {
      await this.connection.query(
        `update front_cms_menu_items SET 
      menu=?,
      page_id=?,
      ext_url=?,
      open_new_tab=?,
      ext_url_link=?,
      slug=?
      where id=?`,
        [createFrontCmsMenu.menu,
        createFrontCmsMenu.page_id,
        createFrontCmsMenu.ext_url,
        createFrontCmsMenu.open_new_tab,
        createFrontCmsMenu.ext_url_link,
        createFrontCmsMenu.slug,
          id
        ],
      );
      const [GetDyncmsmenuitemid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_menu_items WHERE hos_front_cms_menu_items_id=? and hospital_id=?',
        [id, createFrontCmsMenu.hospital_id]
      );
      const Get_Dyn_front_cms_menu_item_ID = GetDyncmsmenuitemid.id;

      const [GetDyncmspageid] = await this.dynamicConnection.query(
        'SELECT id FROM front_cms_pages WHERE hos_front_cms_pages_id=? and hospital_id=?',
        [createFrontCmsMenu.page_id, createFrontCmsMenu.hospital_id]
      );
      const Get_Dyn_front_cms_page_ID = GetDyncmspageid.id;
      await this.dynamicConnection.query(
        `update front_cms_menu_items SET 
      menu=?,
      page_id=?,
      ext_url=?,
      open_new_tab=?,
      ext_url_link=?,
      slug=?,
      hospital_id=?
      where id=?`,
        [createFrontCmsMenu.menu,
          Get_Dyn_front_cms_page_ID,
        createFrontCmsMenu.ext_url,
        createFrontCmsMenu.open_new_tab,
        createFrontCmsMenu.ext_url_link,
        createFrontCmsMenu.slug,
        createFrontCmsMenu.hospital_id,
          Get_Dyn_front_cms_menu_item_ID
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS menu items updated successfully ",
          "updated_values": await this.connection.query('SELECT * FROM front_cms_menu_items WHERE id = ?', [id])
        }
      }];
    } catch (error) {
      console.error('Error while posting data:', error);
    }
  }



  async removeFrontCMSMenuItems(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {

    try {
      await this.connection.query('DELETE FROM front_cms_menu_items WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM front_cms_menu_items WHERE hospital_id = ? and hos_front_cms_menu_items_id=?', [hospital_id, id]);
      return [
        {
          status: 'success',
          message: `Front CMS menu items with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];
    }
    catch (error) {
      console.error('Error while posting data:', error);
    }

  }

}
