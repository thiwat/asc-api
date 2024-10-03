import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { SurveyAnswerInput } from "./answer.dto";
import { SurveyAnswer } from "./answer.schema";
import { SurveyAnswerService } from "./answer.service";
import { Profile } from 'src/common/decorators/profile.decorator'
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { convertFilter } from "src/common/utils/filter";
import { UserRole } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorators/role.decorator";
import { Public } from "src/common/decorators/public.decorator";

@Controller({
  path: 'survey',
  version: '1'
})
export class SurveyAnswerController {
  constructor(
    protected readonly service: SurveyAnswerService
  ) { }

  @Roles([UserRole.admin])
  @Get('/answer')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Roles([UserRole.admin])
  @Get('/answer/:code')
  async findByCode(
    @Param('code') code: string
  ): Promise<SurveyAnswer> {
    return this.service.findByCode(code)
  }

  @Public()
  @Post('/submit')
  async submit(
    @Body() body: SurveyAnswerInput,
    @Profile() profile: any
  ): Promise<SurveyAnswer> {
    return this.service.submit(body, profile)
  }
}