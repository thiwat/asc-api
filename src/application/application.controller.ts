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
import { IgnoreMaskField, MaskFields } from '../common/decorators/mask.decorator'
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { ApplicationService } from "./application.service";
import { ApplicationInput } from "./application.dto";
import { Application } from "./application.schema";
import { Roles } from "src/common/decorators/role.decorator";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";

@Roles([UserRole.admin])
@MaskFields(['secret_key'])
@Controller({
  path: 'application',
  version: '1'
})
export class ApplicationController {
  constructor(protected readonly service: ApplicationService) { }

  @Get('/')
  async list(
    @Query() query: SearchQueryDto,
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Get('/:code')
  async findByCode(
    @Param('code') code: string,
  ): Promise<Application> {
    return this.service.findByCode(code)
  }

  @Post('/')
  @IgnoreMaskField()
  async create(
    @Body() body: ApplicationInput
  ): Promise<Application> {
    return this.service.create(body)
  }

  @Put('/:code')
  async updateByCode(
    @Param('code') code: string,
    @Body() body: ApplicationInput
  ): Promise<Application> {
    return this.service.updateByCode(code, body)
  }

  @Patch('/:code/revoke')
  @IgnoreMaskField()
  async revokeSecretKey(
    @Param('code') code: string
  ): Promise<Application> {
    return this.service.revokeSecret(code)
  }

  @Delete('/:code')
  async deleteByCode(
    @Param('code') code: string,
  ): Promise<Application> {
    return this.service.deleteByCode(code)
  }

}