import {
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from './auth.service'
import {
  AuthenticationInput,
  AuthenticationLineInput,
  AuthenticationOutput,
  RevokeTokenInput,
} from "./auth.dto";
import { Public } from "src/common/decorators/public.decorator";
import { CommonResult } from "src/common/dto/common_result.dto";
import { RecaptchaGuard } from "src/common/guards/recaptcha.guard";

@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(protected readonly service: AuthService) { }

  @Public()
  @UseGuards(RecaptchaGuard)
  @Post('/access_token')
  async authentication(
    @Body() body: AuthenticationInput
  ): Promise<AuthenticationOutput> {
    return this.service.authentication(body)
  }

  @Public()
  @Post('/social/line')
  async authenticationLine(
    @Body() body: AuthenticationLineInput
  ): Promise<AuthenticationOutput> {
    return this.service.authenticationLine(body)
  }

  @Public()
  @Post('/revoke')
  async revokeToken(
    @Body() body: RevokeTokenInput
  ): Promise<CommonResult> {
    return this.service.revokeToken(body)
  }
}