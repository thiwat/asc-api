import * as _ from "lodash";
import * as mongoose from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Setting } from "./setting.schema";
import { BaseService } from "src/common/base/base.service";
import { ApplicationService } from "src/application/application.service";
import { DEFAULT_APPLICATION_CODE } from "src/application/application.constant";
import { Application } from "src/application/application.schema";


@Injectable()
export class SettingService extends BaseService<Setting> {
  constructor(
    @InjectModel(_.snakeCase(Setting.name))
    protected model: mongoose.Model<Setting>,
    private applicationService: ApplicationService
  ) {
    super(model);
  }

  public getSetting = async (
    key: string,
    type?: string,
    defaultValues?: object,
  ): Promise<any> => {
    let result = await this.find({
      type: type || key,
      key
    });
    if (_.isEmpty(result)) {
      await this.create({
        type: type || key,
        key: key,
        ...(defaultValues || {})
      });
      result = await this.find({
        type: type || key,
        key
      });
    }
    return result;
  };

  public setSetting = async (
    key: string,
    data: any,
    type?: string
  ) => {
    let oldData = await this.getSetting(key, type, undefined);
    oldData = _.assign(oldData, data);
    const id = oldData.id;
    delete oldData.id;
    await this.update(id, oldData);
    return this.getSetting(key, type, undefined);
  };

  public async getSiteConfig(app: Application) {
    const authen = await this.getSetting('authentication', 'authentication')
    const security = await this.getSetting('security', 'security')
    const siteSetting = await this.getSetting('site', 'site')
    const integrationSetting = await this.getSetting('integration', 'integration')
    const key = app.code === DEFAULT_APPLICATION_CODE
      ? 'admin'
      : 'site'

    return {
      site: _.get(siteSetting, key) || {},
      password: {
        case: authen?.password_policy?.password_case || [],
        minimum_length: authen?.password_policy?.minimum_length
      },
      line: integrationSetting?.line,
      recaptcha: {
        ..._.omit(security.recaptcha, ['secret_key']),
        enabled: app.use_recaptcha
      }
    }
  }
}
