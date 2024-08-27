import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { RewriteUrlType } from 'src/common/enums/rewrite_url.enum';
import { Event } from './event.schema';
import { EventInput } from './event.dto';
import { RewriteUrlService } from 'src/rewrite_url/rewrite_url.service';
import { Profile } from 'src/common/dto/profile.dto';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class EventService extends BaseService<Event> {
  constructor(
    @InjectModel(_.snakeCase(Event.name))
    protected model: mongoose.Model<Event>,
    private rewriteUrlService: RewriteUrlService,
    private ticketService: TicketService
  ) {
    super(model);
  }

  private async _prepareDataBeforeSave(data: EventInput): Promise<EventInput> {
    if (data.cover) {
      data.cover = await this._prepareImageData(data.cover, {})
    }
    return data
  }

  public async findByCode(code: string): Promise<Event> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async create(data: EventInput): Promise<Event> {
    data.number_of_sold = 0
    const res = await super.create(await this._prepareDataBeforeSave(data))

    const rewriteUrl = await this.rewriteUrlService.generateRewriteUrl({
      ref: data.code,
      type: RewriteUrlType.event
    })

    return await this.updateByCode(res.code, { url_path: rewriteUrl.path })
  }

  public async updateSoldQty(code: string, qty: number): Promise<Event> {
    const order = await this.findByCode(code)
    return await this.update(order.id, { number_of_sold: order.number_of_sold + qty })
  }

  public async updateByCode(code: string, data: EventInput): Promise<Event> {
    delete data['number_of_sold']
    const order = await this.findByCode(code)
    return await this.update(order.id, data)
  }

  public async deleteByCode(code: string): Promise<Event> {
    const order = await this.findByCode(code)
    return await this.delete(order.id)
  }

  public async myEvents(profile: Profile): Promise<any> {
    const tickets = await this.ticketService.list({
      filter: {
        user_id: profile.user_id
      }
    })

    const eventsCode = _.uniq(tickets.map(i => i.event))
    const events = await this.list({
      filter: { code: { $in: eventsCode } },
      sort: '-event_start_date'
    })

    const res = []
    for (const event of events) {
      res.push({
        event,
        tickets: tickets.filter(i => i.event === event.code)
      })
    }

    return res
  }

}