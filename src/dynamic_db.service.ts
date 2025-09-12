
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class DynamicDatabaseService {
  createDynamicDatabaseConfig(ip: string, databaseName: string, password: string,username:string): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host:ip,
      port: 3306,
      username: username,
      password: password,
      database: databaseName,
      entities: ["dist/**/*.entity{.ts,.js}"],
      synchronize: false, 
    };
  }
}