import * as _ from 'lodash'
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { generateTokenKey } from "../utils/key";
import { redisSession } from "../utils/redis";
import { ApplicationService } from 'src/application/application.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly applicationService: ApplicationService
  ) { }

  async _validateRequest(req: any, roles: string[]): Promise<boolean> {
    const authorization = _.get(req, "headers.authorization", "");
    const token = authorization.replace("Bearer ", "");

    if (_.isEmpty(token)) {
      return false;
    }

    const session = await redisSession.get(generateTokenKey(token))
    if (_.isEmpty(session)) {
      return false;
    }

    req.session = {
      token,
      profile: session?.user,
      application: session?.application
    }

    if (_.isEmpty(roles)) return true

    return roles.includes(session?.user?.role)
  }

  async _validateBasicRequest(req: any): Promise<boolean> {
    const authorization = _.get(req, "headers.authorization", "");
    const token = authorization.replace("Basic ", "");

    if (_.isEmpty(token)) {
      return false;
    }

    const [appKey, secretKey] = Buffer.from(token, 'base64').toString().split(':')

    const application = await this.applicationService.find({
      app_key: appKey,
      secret_key: secretKey
    })

    if (_.isEmpty(application)) return false

    req.session = {
      application
    }

    return true
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('is_public', context.getHandler());
    const isBasic = this.reflector.get<boolean>('is_basic', context.getHandler())
    const request = context.switchToHttp().getRequest();
    const restrictRoles = this.reflector.get<string[]>('roles', context.getHandler())
      || this.reflector.get<string[]>('roles', context.getClass())
    const res = isBasic
      ? await this._validateBasicRequest(request)
      : await this._validateRequest(request, restrictRoles);
    if (isPublic) return true
    return res
  }

}