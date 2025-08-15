import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './ticket.schema';
import { IssueTicketInput, MarkUsedTicketInputt } from './ticket.dto';
import { TicketStatus } from 'src/common/enums/ticket.enum';
import { CommonResult } from 'src/common/dto/common_result.dto';

@Injectable()
export class TicketService extends BaseService<Ticket> {
  constructor(
    @InjectModel(_.snakeCase(Ticket.name))
    protected model: mongoose.Model<Ticket>
  ) {
    super(model);
  }

  public async issueTicket(data: IssueTicketInput): Promise<Ticket> {
    return await this.create({
      code: uuid(),
      user: data.user,
      status: TicketStatus.not_used
    })
  }

  public async markUsedTicket(data: MarkUsedTicketInputt): Promise<CommonResult> {
    const ticket = await this.find({ code: data.code })

    if (ticket.status !== TicketStatus.not_used) {
      return {
        status: false
      }
    }

    await this.update(ticket.id, {
      status: TicketStatus.used,
      used_date: new Date()
    })

    return { status: true }
  }
}