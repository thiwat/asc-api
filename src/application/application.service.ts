import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { Application } from "./application.schema";
import { InjectModel } from '@nestjs/mongoose';
import { randomString } from 'src/common/utils/random';
import { throwError } from 'src/common/utils/error';
import {
  APP_KEY_LENGTH,
  DEFAULT_APPLICATION_CODE,
  DEFAULT_APPLICATION_NAME,
  SECRET_KEY_LENGTH
} from './application.constant';
import { ApplicationInput } from './application.dto';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class ApplicationService extends BaseService<Application> {
  constructor(
    @InjectModel(_.snakeCase(Application.name))
    protected model: mongoose.Model<Application>,
  ) {
    super(model);
  }

  onApplicationBootstrap() {
    this._initialDefaultApplication()
  }

  private _generateAppKey = (): string => {
    return randomString(APP_KEY_LENGTH)
  }

  private _generateAppSecret = (): string => {
    return randomString(SECRET_KEY_LENGTH)
  }

  private _initialDefaultApplication = async () => {
    const defaultApplication = await this.find({
      code: DEFAULT_APPLICATION_CODE
    })

    if (_.isEmpty(defaultApplication)) {
      this.logger.info('Create default api key', {
        code: DEFAULT_APPLICATION_CODE
      })
      await this.create({
        name: DEFAULT_APPLICATION_NAME,
        code: DEFAULT_APPLICATION_CODE,
        enabled: true,
        app_key: process.env.DEFAULT_APP_KEY || this._generateAppKey(),
        secret_key: process.env.DEFAULT_SECRET_KEY || this._generateAppSecret(),
        roles: [UserRole.admin]
      })
    }
  }

  public async findByCode(code: string): Promise<Application> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async create(data: Partial<Application>): Promise<Application> {
    data['app_key'] = data['app_key'] || this._generateAppKey()
    data['secret_key'] = data['secret_key'] || this._generateAppSecret()
    return super.create(data)
  }

  public async updateByCode(code: string, data: ApplicationInput): Promise<Application> {
    if (code === DEFAULT_APPLICATION_CODE) {
      throwError('Permission Denied', 'permission_denied')
    }

    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    delete data['app_key']
    delete data['secret_key']

    return this.update(res.id, data)
  }

  public async deleteByCode(code: string): Promise<Application> {
    if (code === DEFAULT_APPLICATION_CODE) {
      throwError('Permission Denied', 'permission_denied')
    }

    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    await this.delete(res.id)
    return res
  }


  public async revokeSecret(code: string): Promise<Application> {
    if (code === DEFAULT_APPLICATION_CODE) {
      throwError('Permission Denied', 'permission_denied')
    }

    const res = await this.find({ code })
    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    this.logger.info('Revoke secret key', {
      code
    })

    return this.update(res.id, {
      secret_key: this._generateAppSecret()
    })
  }
}