import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import * as dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { User } from "./user.schema";
import { InjectModel } from '@nestjs/mongoose';
import { SYSTEM_ADMIN_EMAIL, SYSTEM_ADMIN_USERNAME } from './user.constant';
import { generateHash } from 'src/common/utils/hash';
import {
  CreateUserInput,
  LoginInput,
  LoginOutput,
} from './user.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { Profile } from 'src/common/dto/profile.dto';
import { UserState } from 'src/common/enums/user_state.enum';
import { throwError } from 'src/common/utils/error';
import { SettingService } from 'src/setting/setting.service';
import { randomString } from 'src/common/utils/random';
import { ApplicationService } from 'src/application/application.service';
import { SearchQueryDto } from 'src/common/dto/search_query.dto';
import { SearchResultDto } from 'src/common/dto/search_result.dto';
import { Application } from 'src/application/application.schema';
import { DEFAULT_APPLICATION_CODE } from 'src/application/application.constant';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    private settingService: SettingService,
    private applicationService: ApplicationService,
    @InjectModel(_.snakeCase(User.name))
    protected model: mongoose.Model<User>,
  ) {
    super(model);
  }

  onApplicationBootstrap() {
    this._initialSuperAdminUser()
  }

  private _hashPassword = (password: string, user: Partial<User>): string => {
    return generateHash(password, `${user['created_at']}`)
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

  private async _initialSuperAdminUser() {
    const exists = await this.find({
      username: SYSTEM_ADMIN_USERNAME,
    })

    if (!_.isEmpty(exists)) return

    const now = new Date().toISOString()
    const user: Partial<User> = {
      username: SYSTEM_ADMIN_USERNAME,
      email: SYSTEM_ADMIN_EMAIL,
      full_name: `System Admin`,
      role: UserRole.admin,
      state: UserState.active,
      application: DEFAULT_APPLICATION_CODE
    }

    user['created_at'] = now
    user['password'] = this._hashPassword(
      process.env.DEFAULT_SYSTEM_ADMIN_PASSWORD,
      user
    )

    this.logger.info('Create system admin')
    await this.create(user)
  }

  public async create(data: Partial<User>): Promise<User> {
    data['user_id'] = uuid()
    data['state'] = data.state || UserState.staged
    if (data.profile_image) {
      data.profile_image = await this._prepareImageData(data.profile_image, {})
    }
    return super.create(data)
  }

  public async findByUserId(userId: string): Promise<User> {
    const user = await this.find({ user_id: userId })
    if (_.isEmpty(user)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return user
  }

  public async updateByUserId(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.findByUserId(userId)

    if (user.username === 'system_admin') {
      throwError('Permission Denied', 'permission_denied')
    }

    return await this.update(user.id, data)
  }

  public async deleteByUserId(userId: string): Promise<User> {
    const user = await this.findByUserId(userId)

    if (user.username === 'system_admin') {
      throwError('Permission Denied', 'permission_denied')
    }

    return await this.delete(user.id)
  }

  public async search(query: SearchQueryDto, profile: Profile): Promise<SearchResultDto> {
    _.set(query, 'filter.username', { $ne: SYSTEM_ADMIN_USERNAME })
    return super.search(query)
  }

  public async createUser(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString()
    if (!input.password) {
      input.password = randomString(32);
    }

    input['application'] = DEFAULT_APPLICATION_CODE
    input['created_at'] = now
    input['password'] = this._hashPassword(
      input.password,
      input
    )
    return this.create(input)
  }

  public async unlockUser(userId: string): Promise<User> {
    const user = await this.findByUserId(userId)

    if (user.state !== UserState.locked_out) return user

    return await this.update(user.id, { state: UserState.active })
  }

  public async myProfile(profile: Profile): Promise<User> {
    const res = await this.find({
      user_id: profile.user_id
    })
    return res
  }

  public async login(data: LoginInput): Promise<LoginOutput> {
    const user = await this.find({
      username: data.username,
      application: data.application
    })

    if (_.isEmpty(user)) {
      throwError('Invalid username or password', 'invalid_username_or_password')
    }

    if (user.state === UserState.staged) {
      return { user, need_password: true }
    }

    if (![UserState.active, UserState.locked_out].includes(user.state as UserState)) {
      throwError('Invalid username or password', 'invalid_username_or_password')
    }

    const { password_information } = user

    if (password_information?.lock_until &&
      (dayjs(password_information.lock_until) > dayjs())
    ) {
      throwError('Your account is locked', 'account_is_locked')
    }

    const isWrongPassword = user.password !== generateHash(data.password, user['created_at'])

    if (isWrongPassword) {
      throwError('Invalid username or password', 'invalid_username_or_password')
    }

    await this.update(user.id, {
      last_logged_in_at: new Date(),
    })

    return {
      user
    }
  }

}
