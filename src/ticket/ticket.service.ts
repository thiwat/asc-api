import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './ticket.schema';
import { IssueTicketInput } from './ticket.dto';
import { TicketStatus } from 'src/common/enums/ticket.enum';

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
      user_id: data.user_id,
      event: data.event,
      status: TicketStatus.not_used
    })
  }
}