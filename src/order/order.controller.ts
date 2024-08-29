import * as _ from 'lodash'
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import { SearchQueryDto } from "src/common/dto/search_query.dto";
import { SearchResultDto } from "src/common/dto/search_result.dto";
import { UserRole } from "src/common/enums/role.enum";
import { convertFilter } from "src/common/utils/filter";
import { OrderService } from "./order.service";
import { ApprovePaymentInput, PlaceOrderInput, UploadSlipInput } from "./order.dto";
import { Profile } from "src/common/decorators/profile.decorator";
import { Order } from "./order.schema";
import { Roles } from 'src/common/decorators/role.decorator';

@Controller({
  path: 'order',
  version: '1'
})
export class OrderController {
  constructor(
    protected readonly service: OrderService
  ) { }

  @Get('/')
  async list(
    @Query() query: SearchQueryDto,
    @Profile() profile: any,
  ): Promise<SearchResultDto> {
    query.filter = convertFilter(query.filter)
    if (profile.role === UserRole.customer) {
      _.set(query, 'filter.user_id', profile.user_id)
    }
    return this.service.search(query)
  }

  @Roles([UserRole.admin])
  @Get('/:order_no')
  async lis(
    @Param('order_no') orderNo: string,
  ): Promise<Order> {
    return this.service.findByOrderNo(orderNo)
  }

  @Post('/')
  async placeOrder(
    @Body() data: PlaceOrderInput,
    @Profile() profile: any
  ): Promise<Order> {
    return await this.service.placeOrder(data, profile)
  }

  @Patch('/slip')
  async uploadSlip(
    @Body() data: UploadSlipInput,
    @Profile() profile: any
  ): Promise<Order> {
    return await this.service.uploadSlip(data, profile)
  }

  @Patch('/approve')
  async approvePayment(
    @Body() data: ApprovePaymentInput
  ): Promise<Order> {
    return await this.service.approvePayment(data)
  }
}