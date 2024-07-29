import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { Roles } from "src/common/decorators/role.decorator";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import { CmsPageInput } from "./cms_page.dto";
import { CmsPage } from "./cms_page.schema";
import { CmsPageService } from "./cms_page.service";

@Roles([UserRole.admin])
@Controller({
  path: 'cms/page',
  version: '1'
})
export class CmsPageController {
  constructor(
    protected readonly service: CmsPageService
  ) { }

  @Roles([UserRole.admin, UserRole.customer])
  @Get('/')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Roles([UserRole.admin, UserRole.customer])
  @Get('/:code')
  async findByCode(
    @Param('code') code: string
  ): Promise<CmsPage> {
    return this.service.findByCode(code)
  }

  @Public()
  @Get('/:code/content')
  async findWithContent(
    @Param('code') code: string
  ): Promise<CmsPage> {
    return this.service.findWithContent(code)
  }

  @Post('/')
  async create(
    @Body() body: CmsPageInput
  ): Promise<CmsPage> {
    return this.service.create(body)
  }

  @Put('/:code')
  async updateByCode(
    @Param('code') code: string,
    @Body() data: CmsPageInput
  ): Promise<CmsPage> {
    return this.service.updateByCode(code, data)
  }

  @Delete('/:code')
  async deleteByCode(
    @Param('code') code: string
  ): Promise<CmsPage> {
    return this.service.deleteByCode(code)
  }
}