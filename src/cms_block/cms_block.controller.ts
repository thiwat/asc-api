import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Roles } from "src/common/decorators/role.decorator";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { CmsBlockInput } from "./cms_block.dto";
import { CmsBlock } from "./cms_block.schema";
import { CmsBlockService } from "./cms_block.service";
import { Public } from 'src/common/decorators/public.decorator'
import { convertFilter } from "src/common/utils/filter";

@Roles([UserRole.admin])
@Controller({
  path: 'cms/block',
  version: '1'
})
export class CmsBlockController {
  constructor(
    protected readonly service: CmsBlockService
  ) { }

  @Roles([UserRole.admin, UserRole.customer])
  @Get('/')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Public()
  @Get('/:code')
  async findByCode(
    @Param('code') code: string
  ): Promise<CmsBlock> {
    return this.service.findByCode(code)
  }

  @Post('/')
  async create(
    @Body() body: CmsBlockInput
  ): Promise<CmsBlock> {
    return this.service.create(body)
  }

  @Put('/:code')
  async updateByCode(
    @Param('code') code: string,
    @Body() data: CmsBlockInput
  ): Promise<CmsBlock> {
    return this.service.updateByCode(code, data)
  }

  @Delete('/:code')
  async deleteByCode(
    @Param('code') code: string,
  ): Promise<CmsBlock> {
    return this.service.deleteByCode(code)
  }
}