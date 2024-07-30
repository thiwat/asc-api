import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query
} from "@nestjs/common";
import { Roles } from "src/common/decorators/role.decorator";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import { EventService } from "./event.service";
import { Event } from "./event.schema";
import { EventInput } from "./event.dto";

@Controller({
  path: 'event',
  version: '1'
})
export class EventController {
  constructor(
    protected readonly service: EventService
  ) { }

  @Get('/')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Get('/:code')
  async findByCode(
    @Param('code') code: string
  ): Promise<Event> {
    return this.service.findByCode(code)
  }

  @Roles([UserRole.admin])
  @Post('/')
  async create(
    @Body() body: EventInput
  ): Promise<Event> {
    return this.service.create(body)
  }

  @Roles([UserRole.admin])
  @Put('/:code')
  async updateByCode(
    @Param('code') code: string,
    @Body() data: EventInput
  ): Promise<Event> {
    return this.service.updateByCode(code, data)
  }

  @Roles([UserRole.admin])
  @Delete('/:code')
  async deleteByCode(
    @Param('code') code: string
  ): Promise<Event> {
    return this.service.deleteByCode(code)
  }
}