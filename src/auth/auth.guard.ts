import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private connection: DataSource,
       @InjectDataSource('AdminConnection')
        private readonly dynamicConnection: DataSource,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {

      const request = context.switchToHttp().getRequest();
      const tokenFromHeader = request.headers['authorization'];

      if (!tokenFromHeader) {
        return false;
      }
      // const decoded = jwt.verify(tokenFromHeader, process.env.JWT_SECRET);
      // console.log(decoded, "decoded");
      
      const [getToken] = await this.dynamicConnection.query(
        `SELECT authToken FROM op_hub_staff_login_auth_tokens WHERE authToken = ? and authTokenExpiry >= now()`,
        [tokenFromHeader]
      );
      if (!getToken) {
        return false;
      }

      const accToken = await getToken.authToken;
      // console.log(tokenFromHeader, "tokenFromHeader");
      // console.log(accToken, "accToken");


      if (tokenFromHeader === accToken) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      return false; // Error occurred, deny access
    }
  }
}