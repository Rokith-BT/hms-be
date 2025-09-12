// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AppService {
//   getHello(): string {
//     return 'Hello World!';
//   }

// }

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly dynamicConnection: DataSource,
    @InjectDataSource('AdminConnection')
    private readonly connection: DataSource,
  ) {}
  async onModuleInit() {
    try {
      await this.connection.query(`
        CREATE TABLE IF NOT EXISTS user_payment_summary(
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          wallet_amount_paid varchar(50),
          paid_amount varchar(50),
          due_amount varchar(50),
          coin_paid_amount varchar(50),
          total_online_payments varchar(50),
          total_offline_payments varchar(50),
          total_billed_amount varchar(50),
          total_tax_amount varchar(50),
          overall_subtotal_amount varchar(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error(
        'Failed to create user_payment_summary table :',
        error.message,
      );
    }
    try {
      await this.connection.query(`
        CREATE TABLE IF NOT EXISTS patient_payment_summary(
          patient_id INT AUTO_INCREMENT PRIMARY KEY,
          wallet_amount_paid varchar(50),
          paid_amount varchar(50),
          due_amount varchar(50),
          coin_paid_amount varchar(50),
          total_online_payments varchar(50),
          total_offline_payments varchar(50),
          total_billed_amount varchar(50),
          total_tax_amount varchar(50),
          overall_subtotal_amount varchar(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error(
        'Failed to create patient_payment_summary :',
        error.message,
      );
    }
    try {
      await this.dynamicConnection.query(`
        CREATE TABLE IF NOT EXISTS patient_payment_summary(
          patient_id INT AUTO_INCREMENT PRIMARY KEY,
          wallet_amount_paid varchar(50),
          paid_amount varchar(50),
          due_amount varchar(50),
          coin_paid_amount varchar(50),
          total_online_payments varchar(50),
          total_offline_payments varchar(50),
          total_billed_amount varchar(50),
          total_tax_amount varchar(50),
          overall_subtotal_amount varchar(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Failed to create user_payment_summary :', error.message);
    }
    try {
      await this.connection.query(`
        CREATE TABLE IF NOT EXISTS hospital_payment_summary(
          hos_id INT AUTO_INCREMENT PRIMARY KEY,
          wallet varchar(50),
          paid varchar(50),
          due varchar(50),
          coin_paid varchar(50),
          online varchar(50),
          offline varchar(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Tables created successfully');
    } catch (error) {
      console.error(
        'Failed to create hospital_payment_summary :',
        error.message,
      );
    }

    try {
      await this.connection.query(`
    ALTER TABLE patients
    ADD COLUMN existing_patient_id int(10),
    ADD COLUMN employer_id int(15),
    ADD COLUMN employer_name VARCHAR(100),
    ADD COLUMN employee_id int(50),
    ADD COLUMN occupation VARCHAR(100);
  `);
    } catch (error) {
      console.error('Failed to update patients table:', error.message);
    }

    try {
      await this.dynamicConnection.query(`
    ALTER TABLE patients
    ADD COLUMN existing_patient_id int(10),
    ADD COLUMN employer_id int(15),
    ADD COLUMN employer_name VARCHAR(100),
    ADD COLUMN employee_id int(50),
    ADD COLUMN occupation VARCHAR(100);
  `);
    } catch (error) {
      console.error('Failed to update patients table:', error.message);
    }

    try {
      await this.dynamicConnection.query(`
    ALTER TABLE patients
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
  `);
    } catch (error) {
      console.error('Failed to update patients table:', error.message);
    }

    try {
      await this.connection.query(`
    ALTER TABLE patients
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
  `);
    } catch (error) {
      console.error('Failed to update patients table:', error.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
