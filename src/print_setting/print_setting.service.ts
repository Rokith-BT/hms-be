import { Injectable } from '@nestjs/common';
import { PrintSetting } from './entities/print_setting.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PrintSettingService {
  constructor(
    private readonly connection: DataSource
  ) { }

  async getPrintSettingById(id: number): Promise<PrintSetting | null> {
    const result = await this.connection.query(`SELECT * FROM print_setting WHERE id = ?`, [id]);
    return result.length ? result[0] : null;
  }
  async updateSettingFor(settings: PrintSetting): Promise<any> {
    const { id, print_header, print_footer, setting_for, is_active } = settings;
    try {
      await this.connection.query(
        `UPDATE print_setting SET 
          print_header = ?, 
          print_footer = ?, 
          setting_for = ?, 
          is_active = ? 
        WHERE id = ?`,
        [print_header, print_footer, setting_for, is_active, id]
      );
      return { status: 'success', message: 'Print setting updated successfully' };
    } catch (error) {
      return { status: 'failed', message: 'Update failed', error };
    }
  }
}
