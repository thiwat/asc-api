import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import * as dayjs from 'dayjs'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { Order } from './order.schema';
import { ApprovePaymentInput, PlaceOrderInput, UploadSlipInput } from './order.dto';
import { Profile } from 'src/common/dto/profile.dto';
import { EventService } from 'src/event/event.service';
import { OrderStatus } from 'src/common/enums/order.enum';
import { generateRunningNumber } from 'src/common/utils/running_number';
import { SettingService } from 'src/setting/setting.service';
import { OrderSettings } from 'src/setting/dto/order.dto';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    private eventService: EventService,
    private ticketService: TicketService,
    private settingService: SettingService,
    @InjectModel(_.snakeCase(Order.name))
    protected model: mongoose.Model<Order>
  ) {
    super(model);
  }

  private async _getSettings(): Promise<OrderSettings> {
    return await this.settingService.getSetting('order', 'order', {})
  }

  private async _generateRunningNumber(settingFormat: string): Promise<string> {
    const current = dayjs()
    const format = settingFormat
      .replace('YYYY', current.format('YYYY'))
      .replace('YY', current.format('YY'))
      .replace('MM', current.format('MM'))
      .replace('DD', current.format('DD'))

    const runningLength = format.match(/R[R]{1,}$/)[0]
    return generateRunningNumber('order', format.replace(runningLength, ''), runningLength.length)
  }

  public async placeOrder(data: PlaceOrderInput, profile: Profile): Promise<Order> {
    const event = await this.eventService.findByCode(data.event)

    if (data.quantity > (event.number_of_seat - event.number_of_sold)) {
      throwError('Exceed maximum quantity', 'exceed_maximum_quantity')
    }

    const settings = await this._getSettings()

    const orderNo = await this._generateRunningNumber(settings.running_format || 'ASCYYMMRRRR')

    const order = await this.create({
      order_no: orderNo,
      status: OrderStatus.pending_payment,
      event: data.event,
      user_id: profile.user_id,
      quantity: data.quantity
    })

    await this.eventService.updateSoldQty(data.event, data.quantity)

    return order
  }

  public async uploadSlip(data: UploadSlipInput, profile: Profile): Promise<Order> {
    const order = await this.find({
      order_no: data.order_no,
      user_id: profile.user_id
    })

    if (_.isEmpty(order)) {
      throwError('Permission Denied', 'permission_denied')
    }

    if (order.status !== OrderStatus.pending_payment) {
      throwError('Invalid order status', 'invalid_order_status')
    }

    return await this.update(order.id, { slip_url: data.slip_url, status: OrderStatus.paid })
  }

  public async approvePayment(data: ApprovePaymentInput): Promise<Order> {
    const order = await this.find({ order_no: data.order_no })

    if (_.isEmpty(order)) {
      throwError('Permission Denied', 'permission_denied')
    }

    if (order.status !== OrderStatus.paid) {
      throwError('Invalid order status', 'invalid_order_status')
    }

    const res = await this.update(order.id, {
      status: OrderStatus.completed
    })

    for (let i = 0; i < order.quantity; i++) {
      await this.ticketService.issueTicket({
        user_id: order.user_id,
        event: order.event,
      })
    }

    return res
  }
}