import {
  Body,
  Controller,
  Patch,
} from "@nestjs/common";
import { TicketService } from "./ticket.service";
import { MarkUsedTicketInputt } from "./ticket.dto";
import { CommonResult } from "src/common/dto/common_result.dto";
import { Public } from "src/common/decorators/public.decorator";

@Controller({
  path: 'ticket',
  version: '1'
})
export class TicketController {
  constructor(
    protected readonly service: TicketService
  ) { }

  @Public()
  @Patch('/mark_used')
  async updateByCode(
    @Body() data: MarkUsedTicketInputt
  ): Promise<CommonResult> {
    return this.service.markUsedTicket(data)
  }
}