import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthGuardRefresh implements CanActivate {
  constructor(
    private readonly connection: DataSource,
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
      console.log(tokenFromHeader, "tokenFromHeader");

      const [getToken] = await this.dynamicConnection.query(
        `SELECT authToken FROM op_hub_staff_login_auth_tokens WHERE authToken = ? `,
        [tokenFromHeader]
      );
      console.log(getToken, "getToken");
      if (!getToken) {
        return false;
      }

      const accToken = await getToken.authToken;

      if (tokenFromHeader === accToken) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      return false;
    }
  }
}