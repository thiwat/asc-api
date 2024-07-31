import {
  Controller,
} from "@nestjs/common";
import { TicketService } from "./ticket.service";

@Controller({
  path: 'ticket',
  version: '1'
})
export class TicketController {
  constructor(
    protected readonly service: TicketService
  ) { }
}