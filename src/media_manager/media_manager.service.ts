import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { MediaManager } from "./entities/media_manager.entity";


@Injectable()
export class MediaManagerService {

  constructor(private readonly connection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly dynamicConnection: DataSource,
  ) { }

  async create(createMediaManager: MediaManager) {

    try {
      let front_cms_media_manager_id;
      const frontcmsmediaManager = await this.connection.query(
        `INSERT into front_cms_media_gallery (
    image,
    thumb_path,
    dir_path,
    img_name,
    thumb_name,
    file_type,
    file_size,
    vid_url,
    vid_title
           ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [createMediaManager.image,
        createMediaManager.thumb_path,
        createMediaManager.dir_path,
        createMediaManager.img_name,
        createMediaManager.thumb_name,
        createMediaManager.file_type,
        createMediaManager.file_size,
        createMediaManager.vid_url,
        createMediaManager.vid_title
        ],
      );

      front_cms_media_manager_id = frontcmsmediaManager.insertId;

      // -------------------------------------//

      await this.dynamicConnection.query(
        `INSERT into front_cms_media_gallery (
    image,
    thumb_path,
    dir_path,
    img_name,
    thumb_name,
    file_type,
    file_size,
    vid_url,
    vid_title,
    hospital_id,
    hos_front_cms_media_gallery_id
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [createMediaManager.image,
        createMediaManager.thumb_path,
        createMediaManager.dir_path,
        createMediaManager.img_name,
        createMediaManager.thumb_name,
        createMediaManager.file_type,
        createMediaManager.file_size,
        createMediaManager.vid_url,
        createMediaManager.vid_title,
        createMediaManager.hospital_id,
          front_cms_media_manager_id
        ],
      );
      return [{
        "data ": {
          status: "success",
          "messege": "Front CMS media manager details added successfully ",
          "media_values": await this.connection.query('SELECT * FROM front_cms_media_gallery WHERE id = ?', [front_cms_media_manager_id])
        }
      }];

    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }




  async removeFrontCMSMediaManager(id: number, hospital_id: number): Promise<{ [key: string]: any }[]> {
    try {
      await this.connection.query('DELETE FROM front_cms_media_gallery WHERE id = ?', [id]);
      await this.dynamicConnection.query('DELETE FROM front_cms_media_gallery WHERE hospital_id = ? and hos_front_cms_media_gallery_id=?', [hospital_id, id]);
      return [
        {
          status: 'success',
          message: `Front CMS media manager with id: ${id} and associated entries in the dynamic database have been deleted.`,
        },
      ];

    }
    catch (error) {
      console.error('Error while posting data:', error);
    }
  }

}
