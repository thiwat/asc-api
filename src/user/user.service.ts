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
  ActivateAccountInput,
  CreateUserInput,
  ForgotPasswordInput,
  ForgotPasswordOutput,
  LoginInput,
  LoginOutput,
  RegisterInput,
  RegisterOutput,
  ResendOtpInput,
  ResendOtpOutput,
  ResetPasswordInput,
  UpdateMyProfileInput,
  VerifyOtpInput
} from './user.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { Profile } from 'src/common/dto/profile.dto';
import { UserState } from 'src/common/enums/user_state.enum';
import { generateOtp, resendOtp, validateOtp } from 'src/common/utils/otp';
import { CommonResult } from 'src/common/dto/common_result.dto';
import { throwError } from 'src/common/utils/error';
import { AuthenticationSettings } from 'src/setting/dto/authentication.dto';
import { SettingService } from 'src/setting/setting.service';
import { RESET_PASSWORD_TOKEN_LENGTH, validatePasswordCase } from 'src/common/utils/password';
import { randomString } from 'src/common/utils/random';
import { REF_LENGTH } from 'src/common/utils/otp'
import { generateRegisterKey, generateResetPasswordToken, generateTokenKey } from 'src/common/utils/key';
import { redisCache, redisSession } from 'src/common/utils/redis';
import { OtpAction } from 'src/common/enums/otp.enum';
import { AuthenticationOutput } from 'src/auth/auth.dto';
import { ApplicationService } from 'src/application/application.service';
import { ACCESS_TOKEN_LENGTH, ACCESS_TOKEN_TTL } from 'src/auth/auth.constant';
import { SearchQueryDto } from 'src/common/dto/search_query.dto';
import { SearchResultDto } from 'src/common/dto/search_result.dto';
import { Application } from 'src/application/application.schema';
import { DEFAULT_APPLICATION_CODE } from 'src/application/application.constant';
import { SecuritySetting } from 'src/setting/dto/security.dto';

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

  private _getAuthenticationSetting = async (): Promise<AuthenticationSettings> => {
    return this.settingService.getSetting('authentication', 'authentication')
  }

  private _getSecuritySetting = async (): Promise<SecuritySetting> => {
    return this.settingService.getSetting('security', 'security')
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

  private _checkValidPassword = (
    password: string,
    hashPassword: string,
    user: User,
    settings: AuthenticationSettings
  ): { password_histories: string[] } => {

    const { password_policy } = settings

    if (password_policy?.minimum_length && password.length < password_policy?.minimum_length) {
      throwError('Invalid password length', 'invalid_password_length')
    }

    if (!validatePasswordCase(password, password_policy)) {
      throwError('Invalid password case', 'invalid_password_case')
    }

    let passwordHistories: string[] = user?.password_histories || []
    if (password_policy?.enforce_password_history > 0 && passwordHistories.includes(hashPassword)) {
      throwError('Unable to reuse password', 'unable_to_reuse_password')
    }

    passwordHistories = [
      ..._.takeRight(passwordHistories, password_policy?.enforce_password_history - 1),
      hashPassword
    ]

    return {
      password_histories: passwordHistories,
    }
  }

  private _validatePassword = async (
    password: string,
    user: User
  ): Promise<void> => {

    const { password_policy } = await this._getAuthenticationSetting()

    const isWrongPassword = user.password !== generateHash(password, user['created_at'])

    if (!isWrongPassword) {
      if (user.state === UserState.locked_out) {
        await this.update(user.id, { state: UserState.active })
      }
      return
    }

    if (!(password_policy?.wrong_password_attempt > 0)) {
      throwError('Invalid username or password', 'invalid_username_or_password')
    }
    const { password_information } = user

    let count = password_information['wrong_attempt'] || 0

    if (password_information?.wrong_attempt_at &&
      (dayjs() > dayjs(password_information.wrong_attempt_at).add(password_policy.wrong_password_attempt_duration, 'minutes'))
    ) {
      password_information['wrong_attempt_at'] = null
      count = 0
    }

    count = count + 1
    password_information['wrong_attempt_at'] = password_information['wrong_attempt_at']
      ? new Date(password_information['wrong_attempt_at'])
      : new Date()

    const isLock = count > password_policy.wrong_password_attempt

    const lockDuration = isLock
      ? password_policy['unlock_user_after_x_minutes'][count - password_policy.wrong_password_attempt - 1]
      ?? _.last(password_policy['unlock_user_after_x_minutes'])
      : 0

    if (lockDuration > 0) {
      password_information['lock_until'] = dayjs().add(lockDuration, 'minute').toDate()
    }

    password_information['wrong_attempt'] = count

    await this.update(user.id, {
      state: isLock
        ? UserState.locked_out
        : UserState.active,
      password_information
    })

    isLock
      ? throwError('Your account is locked', 'account_is_locked')
      : throwError('Invalid username or password', 'invalid_username_or_password')
  }

  public async create(data: Partial<User>): Promise<User> {
    data['user_id'] = uuid()
    data['state'] = data.state || UserState.staged
    data['full_name'] = `${data['first_name']} ${data['last_name']}`
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

  public async activateAccount(input: ActivateAccountInput): Promise<User> {

    const settings = await this._getAuthenticationSetting()
    const user = await this.findByUserId(input.user_id)

    const newPassword = generateHash(input.password, user['created_at'])
    const { password_histories } = await this._checkValidPassword(
      input.password,
      newPassword,
      user,
      settings
    )

    return await this.update(user.id, {
      state: UserState.active,
      last_logged_in_at: new Date(),
      password: newPassword,
      password_histories,
      password_information: {
        password_at: new Date(),
        wrong_attempt: 0
      },
    })
  }

  public async myProfile(profile: Profile): Promise<User> {
    const res = await this.find({
      user_id: profile.user_id
    })
    return res
  }

  public async updateMyProfile(data: UpdateMyProfileInput, profile: Profile): Promise<User> {
    const res = await this.find({
      user_id: profile.user_id
    })

    if (data.profile_image) {
      data.profile_image = await this._prepareImageData(data.profile_image, res?.profile_image)
    }

    return await this.update(res.id, _.pick(data, [
      'full_name',
      'first_name',
      'last_name',
      'profile_image',
      'mobile_no',
      'date_of_birth',
      'prefix',
      'citizen_number',
      'address'
    ]))
  }

  public async register(data: RegisterInput): Promise<RegisterOutput> {
    const now = new Date().toISOString()

    const app = await this._getApp(data.app_key, data.secret_key)

    const isExists = await this.find({
      email: data.email,
      application: app.code
    })

    if (!_.isEmpty(isExists)) {
      throwError('Email already exists', 'email_already_exists')
    }

    data['created_at'] = now
    data['application'] = app.code

    const settings = await this._getAuthenticationSetting()
    const newPassword = this._hashPassword(
      data['password'],
      data
    )

    const { password_histories } = this._checkValidPassword(
      data.password,
      newPassword,
      null,
      settings
    )

    data['username'] = data['email']
    data['role'] = UserRole.customer
    data['state'] = UserState.active
    data['password'] = newPassword
    data['password_histories'] = password_histories
    data['password_information'] = {
      password_at: new Date(),
      wrong_attempt: 0
    }

    if (data.register_token) {
      const redisData = await redisSession.get(generateRegisterKey(data.register_token))
      if (redisData?.['channel']) _.set(data, `social.${redisData['channel']}`, redisData['profile']['id'])
    }

    const res = await this.create(data)

    const { ref } = await generateOtp({
      id: res.id,
      user_id: res.user_id,
      email: data['email'],
      app,
      type: OtpAction.register
    })

    return {
      ref
    }
  }

  public async verifyOtp(data: VerifyOtpInput): Promise<CommonResult | AuthenticationOutput> {
    const securitySettings = await this._getSecuritySetting()
    const otpData = await validateOtp(data.otp, securitySettings)

    if (otpData.data['type'] === OtpAction.register) {
      const user = await this.update(otpData.data['id'], {
        state: UserState.active
      })

      const app = otpData.data['app']
      const token = randomString(ACCESS_TOKEN_LENGTH)
      const session = {
        user: _.omit(user, ['password']),
        application: _.omit(app, ['secret_key'])
      }

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

    if (otpData.data['type'] === OtpAction.forgot_password) {
      const redisKey = generateResetPasswordToken(otpData.data['reset_password_token'])
      const redisData = await redisCache.get(redisKey)
      await redisCache.set(redisKey, {
        ...redisData,
        is_verify: true
      })
    }

    return { status: true }
  }

  public async resendOtp(data: ResendOtpInput): Promise<ResendOtpOutput> {
    const { ref, otp, data: redisData } = await resendOtp(data.ref)

    return { ref }
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

    await this._validatePassword(data.password, user)

    await this.update(user.id, {
      last_logged_in_at: new Date(),
      password_information: {
        password_at: password_information?.password_at || new Date(),
        wrong_attempt: 0
      }
    })

    return {
      user
    }
  }

  public async forgotPassword(data: ForgotPasswordInput): Promise<ForgotPasswordOutput> {

    const app = await this._getApp(data.app_key, data.secret_key)

    const user = await this.find({
      username: data.username,
      application: app.code
    })

    const resetPasswordToken = randomString(RESET_PASSWORD_TOKEN_LENGTH)

    if (_.isEmpty(user)) {
      return {
        ref: randomString(REF_LENGTH),
        reset_password_token: resetPasswordToken
      }
    }

    const { ref, otp } = await generateOtp({
      reset_password_token: resetPasswordToken,
      type: OtpAction.forgot_password
    })

    await redisCache.set(generateResetPasswordToken(resetPasswordToken), {
      id: user.id,
      user_id: user.user_id,
      email: data.username,
      is_verify: false,
    })

    return {
      ref,
      reset_password_token: resetPasswordToken
    }
  }

  public async resetPassword(data: ResetPasswordInput): Promise<CommonResult> {

    const redisKey = generateResetPasswordToken(data.reset_password_token)
    const redisData = await redisCache.get(redisKey)

    if (_.isEmpty(redisData) || !_.get(redisData, 'is_verify')) {
      throwError('Invalid reset password token', 'invalid_reset_password_token')
    }

    const user = await this.findByUserId(redisData.user_id)
    const settings = await this._getAuthenticationSetting()

    const { password_policy } = settings

    const notAllowToChange = password_policy.minimum_password_age > 0
      && dayjs(user.password_information?.password_at).add(password_policy.minimum_password_age, 'day') > dayjs()

    if (notAllowToChange) {
      throwError('Minimum password age', 'minimum_password_age')
    }

    const newPassword = generateHash(data.new_password, user['created_at'])
    const { password_histories } = await this._checkValidPassword(
      data.new_password,
      newPassword,
      user,
      settings
    )

    await this.update(user.id, {
      password: newPassword,
      password_histories,
      password_information: {
        password_at: new Date(),
        wrong_attempt: 0
      }
    })

    await redisCache.del(redisKey)

    return { status: true }
  }
}
