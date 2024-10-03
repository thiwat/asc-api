import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { Roles } from "src/common/decorators/role.decorator";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import { SurveyInput } from "./survey.dto";
import { Survey } from "./survey.schema";
import { SurveyService } from "./survey.service";

@Roles([UserRole.admin])
@Controller({
  path: 'survey',
  version: '1'
})
export class SurveyController {
  constructor(
    protected readonly service: SurveyService
  ) { }

  @Get('/')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Public()
  @Roles([UserRole.admin, UserRole.customer])
  @Get('/:code')
  async findByCode(
    @Param('code') code: string
  ): Promise<Survey> {
    return this.service.findByCode(code)
  }

  @Post('/')
  async create(
    @Body() body: SurveyInput
  ): Promise<Survey> {
    return this.service.create(body)
  }

  @Put('/:code')
  async updateByCode(
    @Param('code') code: string,
    @Body() data: SurveyInput
  ): Promise<Survey> {
    return this.service.updateByCode(code, data)
  }

  @Delete('/:code')
  async deleteByCode(
    @Param('code') code: string,
  ): Promise<Survey> {
    return this.service.deleteByCode(code)
  }
}