import * as _ from 'lodash'
import { Injectable } from "@nestjs/common";
import { Logger } from 'winston';
import logger from 'src/common/utils/logger';
import { GetProfileOutput } from './line.dto';
import axios from 'axios';
import { SettingService } from 'src/setting/setting.service';
import { IntegrationLineSetting } from 'src/setting/dto/integration.dto';

const LINE_API_DOMAIN = 'https://api.line.me'

@Injectable()
export class LineService {
  private logger: Logger
  constructor(
    private settingService: SettingService,
  ) {
    this.logger = logger.child({ service: this.constructor.name })
  }

  private async _getSetting(): Promise<IntegrationLineSetting> {
    const settings = await this.settingService.getSetting('integration', 'integration', {})
    return settings?.line || {}
  }

  private async _requestLine(path: string, body: any, headers: any): Promise<any> {
    const res = await axios({
      method: 'get',
      url: `${LINE_API_DOMAIN}${path}`,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
    return res.data
  }

  private async _getProfile(token: string): Promise<any> {
    return await this._requestLine(
      '/v2/profile',
      undefined,
      { Authorization: `Bearer ${token}` }
    )
  }


  public async getProfile(lineToken: string): Promise<GetProfileOutput> {
    const settings = await this._getSetting()

    if (settings.enable_mock_mode) {
      return {
        sub: '123456',
        name: 'Mock User',
        picture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
      }
    }

    const profile = await this._getProfile(lineToken)

    return {
      sub: profile['userId'],
      name: profile['displayName'],
      picture: profile['pictureUrl']
    }
  }
}