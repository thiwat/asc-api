import * as _ from 'lodash'
import { Injectable } from "@nestjs/common";
import { Logger } from 'winston';
import logger from 'src/common/utils/logger';
import {
  AuthenticationInput,
  AuthenticationOutput,
  RevokeTokenInput,
} from './auth.dto';
import { UserService } from 'src/user/user.service';
import { throwError } from 'src/common/utils/error';
import { randomString } from 'src/common/utils/random';
import {
  ACCESS_TOKEN_LENGTH,
  ACCESS_TOKEN_TTL,
  ACTIVATE_TOKEN_LENGTH,
  ACTIVATE_TOKEN_TTL
} from './auth.constant';
import { redisSession } from 'src/common/utils/redis';
import { generateActivateTokenKey, generateTokenKey } from 'src/common/utils/key'
import { ApplicationService } from 'src/application/application.service';
import { CommonResult } from 'src/common/dto/common_result.dto';
import { Application } from 'src/application/application.schema';

@Injectable()
export class AuthService {
  private logger: Logger
  constructor(
    private applicationService: ApplicationService,
    private userService: UserService
  ) {
    this.logger = logger.child({ service: this.constructor.name })
  }


  private async _getApp(appKey: string, secretKey: string): Promise<Application> {
    const app = await this.applicationService.find({
      app_key: appKey
    })

    if (_.isEmpty(app) || !app.enabled) {
      this.logger.error('Invalid app key', {
        app_key: appKey
      })
      throwError('Invalid application', 'invalid_application')
    }

    if (app.secret_key !== secretKey) {
      this.logger.error('Invalid secret key', {
        app_key: appKey
      })
      throwError('Invalid application', 'invalid_application')
    }

    return app
  }

  public async authentication(
    input: AuthenticationInput
  ): Promise<AuthenticationOutput> {

    input.username = input.username.toLowerCase().trim()

    const app = await this._getApp(input.app_key, input.secret_key)

    const { user, need_password } = await this.userService.login({
      username: input.username,
      password: input.password,
      application: app.code
    })

    if (need_password) {
      const passwordToken = randomString(ACTIVATE_TOKEN_LENGTH)
      await redisSession.set(
        generateActivateTokenKey(passwordToken),
        { user, application: app },
        ACTIVATE_TOKEN_TTL
      )

      return {
        need_password,
        password_token: passwordToken
      }
    }

    if (!app.roles.includes(user.role)) {
      this.logger.error('User role cannot access this application', {
        username: input.username,
        application: app.code
      })
      throwError('Invalid username or password', 'invalid_username_or_password')
    }

    const token = randomString(ACCESS_TOKEN_LENGTH)
    const session = {
      user: _.omit(user, ['password']),
      application: _.omit(app, ['secret_key'])
    }

    this.logger.info('Login success', {
      username: input.username
    })


    await redisSession.set(
      generateTokenKey(token),
      session,
      ACCESS_TOKEN_TTL
    )

    return {
      token,
      expires_in: ACCESS_TOKEN_TTL
    }
  }

  public async revokeToken(data: RevokeTokenInput): Promise<CommonResult> {
    await redisSession.del(generateTokenKey(data.token))
    this.logger.info('Revoke token success')
    return { status: true }
  }
}