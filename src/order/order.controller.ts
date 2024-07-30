import {
  Body,
  Controller,
  Get,
  Post,
  Query
} from "@nestjs/common";
import { Roles } from "src/common/decorators/role.decorator";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import { OrderService } from "./order.service";
import { PlaceOrderInput } from "./order.dto";
import { Profile } from "src/common/decorators/profile.decorator";
import { Order } from "./order.schema";

@Controller({
  path: 'order',
  version: '1'
})
export class OrderController {
  constructor(
    protected readonly service: OrderService
  ) { }

  @Roles([UserRole.admin])
  @Get('/')
  async list(
    @Query() query: SearchQueryDto
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    return this.service.search(query)
  }

  @Post('/')
  async placeOrder(
    @Body() data: PlaceOrderInput,
    @Profile() profile: any
  ): Promise<Order> {
    return await this.service.placeOrder(data, profile)
  }
}