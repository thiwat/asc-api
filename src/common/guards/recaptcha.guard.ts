import * as _ from 'lodash'
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SettingService } from 'src/setting/setting.service';
import { SecurityRecaptcha, SecuritySetting } from 'src/setting/dto/security.dto';
import axios from 'axios'
import { Logger } from 'winston';
import logger from '../utils/logger';
import { ApplicationService } from 'src/application/application.service';

const GOOGLE_RECAPTCHA_API = "https://www.google.com/recaptcha/api/siteverify";

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private logger: Logger
  constructor(
    private readonly reflector: Reflector,
    private readonly settingService: SettingService,
    private readonly applicationService: ApplicationService
  ) {
    this.logger = logger.child({ service: this.constructor.name })
  }

  async _getSecuritySetting(): Promise<SecuritySetting> {
    return this.settingService.getSetting('security', 'security', {})
  }

  async _validateRecaptchaToken(token: string, setting: SecurityRecaptcha): Promise<boolean> {
    const url = `${GOOGLE_RECAPTCHA_API}?secret=${setting.secret_key}&response=${token}`
    const res = await axios.post(url)
    return res.data.success
  }

  async _validateRequest(req: any): Promise<boolean> {
    const settings = await this._getSecuritySetting()
    const app = await this.applicationService.find({
      app_key: _.get(req, 'body.app_key'),
      secret_key: _.get(req, 'body.secret_key')
    })

    if (!_.get(app, 'use_recaptcha')) return true

    const recaptchaToken = _.get(req, 'body.recaptcha_token')

    if (!recaptchaToken) return false

    const res = await this._validateRecaptchaToken(recaptchaToken, settings.recaptcha)
      .catch(e => { })

    res
      ? this.logger.info('Validate recaptcha token success', {
        recaptcha_token: recaptchaToken
      })
      : this.logger.error('Validate recaptcha failed', {
        recaptcha_token: recaptchaToken
      })

    return res || false
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    return this._validateRequest(context.switchToHttp().getRequest())
  }

}