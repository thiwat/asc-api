import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import { SettingInterceptor } from "src/common/interceptors/setting.interceptor";
import { SettingService } from "./setting.service";
import * as _ from "lodash"
import { Public } from "src/common/decorators/public.decorator";
import { AuthenticationSettings } from "./dto/authentication.dto";
import { DEFAULT_ADMIN_TRANSLATE, DEFAULT_SITE_TRANSLATE } from "src/common/constants/translates";
import { SecuritySetting } from "./dto/security.dto";
import { SearchSettings } from "./dto/search.dto";
import { AttachmentSetting } from "./dto/attachment.dto";
import { SiteSetting } from "./dto/site.dto";
import { Basic } from "src/common/decorators/basic.decorator";
import { Application } from "src/common/decorators/application.decorator";

const DEFAULT_LOCALE = 'en-US'

@UseInterceptors(SettingInterceptor)
@Controller({
  path: "/setting",
  version: "1",
})
export class SettingController {
  constructor(
    protected readonly service: SettingService
  ) { }


  @Public()
  @Get('/translate/admin/:locale')
  async getAdminTranslateSetting(
    @Param('locale') locale: string
  ): Promise<object> {
    return await this.service.getSetting(`admin_${locale || DEFAULT_LOCALE}`, 'translate', DEFAULT_ADMIN_TRANSLATE)
  }

  @Put('/translate/admin/:locale')
  async setAdminTranslateSetting(
    @Param('locale') locale: string,
    @Body() data: object
  ): Promise<object> {
    return await this.service.setSetting(`admin_${locale || DEFAULT_LOCALE}`, data, 'translate')
  }


  @Get('/attachment')
  async getAttachmentSetting(): Promise<AttachmentSetting> {
    return await this.service.getSetting('attachment', 'attachment', {})
  }

  @Put('/attachment')
  async setAttachmentSetting(
    @Body() data: AttachmentSetting
  ): Promise<AttachmentSetting> {
    return await this.service.setSetting('attachment', data, 'attachment')
  }

  @Get('/search')
  async getSearchSetting(): Promise<SearchSettings> {
    return await this.service.getSetting('search', 'search', {})
  }

  @Put('/search')
  async setSearchSetting(
    @Body() data: SearchSettings
  ): Promise<SearchSettings> {
    return await this.service.setSetting('search', data, 'search')
  }


  @Get('/site')
  async getSiteSetting(): Promise<SiteSetting> {
    return await this.service.getSetting('site', 'site', {})
  }

  @Put('/site')
  async setSiteSetting(
    @Body() data: SiteSetting
  ): Promise<SiteSetting> {
    return await this.service.setSetting('site', data, 'site')
  }

  @Get('/security')
  async getSecuritySetting(): Promise<SecuritySetting> {
    return await this.service.getSetting('security', 'security', {})
  }

  @Put('/security')
  async setSecuritySetting(
    @Body() data: SecuritySetting
  ): Promise<SecuritySetting> {
    return await this.service.setSetting('security', data, 'security')
  }

  @Public()
  @Get('/translate/site/:locale')
  async getSiteTranslateSetting(
    @Param('locale') locale: string
  ): Promise<object> {
    return await this.service.getSetting(`site_${locale || DEFAULT_LOCALE}`, 'translate', DEFAULT_SITE_TRANSLATE)
  }

  @Put('/translate/site/:locale')
  async setSiteTranslateSetting(
    @Param('locale') locale: string,
    @Body() data: object
  ): Promise<object> {
    return await this.service.setSetting(`site_${locale || DEFAULT_LOCALE}`, data, 'translate')
  }

  @Get('/authentication')
  async getAuthenticationSetting(): Promise<AuthenticationSettings> {
    return await this.service.getSetting('authentication', 'authentication', {})
  }

  @Put('/authentication')
  async setAuthenticationSettinng(
    @Body() data: AuthenticationSettings
  ): Promise<AuthenticationSettings> {
    return await this.service.setSetting('authentication', data, 'authentication')
  }

  @Basic()
  @Get('/site/config')
  async getSiteConfig(
    @Application() application: any
  ): Promise<any> {
    return this.service.getSiteConfig(application)
  }
}

