import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AuthenticationOutput } from "src/auth/auth.dto";
import { HideFields } from "src/common/decorators/hide.decorator";
import { Profile } from "src/common/decorators/profile.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { Roles } from "src/common/decorators/role.decorator";
import { CommonResult } from "src/common/dto/common_result.dto";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ForgotPasswordOutput,
  RegisterInput,
  RegisterOutput,
  ResendOtpInput,
  ResendOtpOutput,
  ResetPasswordInput,
  UpdateMyProfileInput,
  VerifyOtpInput
} from "./user.dto";
import { User } from "./user.schema";
import { UserService } from "./user.service";

@Roles([UserRole.admin])
@HideFields(['password', 'password_information', 'password_histories'])
@Controller({
  path: 'user',
  version: '1'
})
export class UserController {
  constructor(protected readonly service: UserService) { }

  @Roles([UserRole.admin])
  @Get('/')
  async list(
    @Query() query: SearchQueryDto,
    @Profile() profile: any
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query, profile)
  }

  @Get('/:user_id')
  async findByUserId(
    @Param('user_id') userId: string
  ): Promise<User> {
    return this.service.findByUserId(userId)
  }

  @Post('/')
  async createUser(
    @Body() body: CreateUserInput
  ): Promise<User> {
    return this.service.createUser(body)
  }

  @Public()
  @Post('/register')
  async register(
    @Body() body: RegisterInput
  ): Promise<RegisterOutput> {
    return this.service.register(body)
  }

  @Public()
  @Post('/verify')
  async verifyOtp(
    @Body() body: VerifyOtpInput
  ): Promise<CommonResult | AuthenticationOutput> {
    return this.service.verifyOtp(body)
  }

  @Public()
  @Post('/resend')
  async resendOtp(
    @Body() body: ResendOtpInput
  ): Promise<ResendOtpOutput> {
    return this.service.resendOtp(body)
  }

  @Public()
  @Post('/password/forgot')
  async forgotPassword(
    @Body() body: ForgotPasswordInput
  ): Promise<ForgotPasswordOutput> {
    return this.service.forgotPassword(body)
  }

  @Public()
  @Post('/password/reset')
  async resetPassword(
    @Body() body: ResetPasswordInput
  ): Promise<CommonResult> {
    return this.service.resetPassword(body)
  }

  @Roles([UserRole.admin])
  @Put('/:user_id')
  async update(
    @Param('user_id') userId: string,
    @Body() body: any,
  ): Promise<User> {
    return this.service.updateByUserId(userId, body)
  }

  @Roles([UserRole.admin])
  @Delete('/:user_id')
  async delete(
    @Param('user_id') userId: string,
  ): Promise<User> {
    return this.service.deleteByUserId(userId)
  }

  @Roles([UserRole.admin, UserRole.customer])
  @Get('/me')
  async myProfile(
    @Profile() profile: any
  ): Promise<User> {
    return this.service.myProfile(profile)
  }

  @Roles([UserRole.admin, UserRole.customer])
  @Put('/me')
  async updateMyProfile(
    @Body() data: UpdateMyProfileInput,
    @Profile() profile: any
  ): Promise<User> {
    return this.service.updateMyProfile(data, profile)
  }

  @Roles([UserRole.admin])
  @Patch('/unlock/:id')
  async unlockUser(
    @Param('id') userId: string
  ): Promise<User> {
    return this.service.unlockUser(userId)
  }
}