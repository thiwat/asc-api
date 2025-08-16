import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import * as dayjs from 'dayjs'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { throwError } from 'src/common/utils/error';
import { Order } from './order.schema';
import { ApprovePaymentInput, ListTicketsInput, PlaceOrderInput } from './order.dto';
import { OrderStatus } from 'src/common/enums/order.enum';
import { generateRunningNumber } from 'src/common/utils/running_number';
import { SettingService } from 'src/setting/setting.service';
import { OrderSettings } from 'src/setting/dto/order.dto';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
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

  public async placeOrder(data: PlaceOrderInput): Promise<Order> {

    const totalAmount = ((data.items?.players?.length || 0) * 1000)
      + ((data?.items?.extra_ticket || 0) * 300)

    const settings = await this._getSettings()

    const orderNo = await this._generateRunningNumber(
      settings.running_format || 'ASCYYMMRRRR'
    )

    const order = await this.create({
      order_no: orderNo,
      status: OrderStatus.paid,
      user: data.user,
      slip_url: data.slip_url,
      items: data.items,
      total_amount: totalAmount,
    })

    return order
  }

  public async findByOrderNo(orderNo: string): Promise<Order> {
    return this.find({ order_no: orderNo })
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

    const totalTickets = ((order.items?.players?.length || 0) * 2)
      + (order.items?.extra_ticket || 0)

    for (let i = 0; i < totalTickets; i++) {
      await this.ticketService.issueTicket({
        user: order?.user?.email,
        order: order.order_no
      })
    }

    return res
  }

  public async listTickets(data: ListTicketsInput): Promise<any> {
    const tickets = await this.ticketService.list({
      filter: { order: data.order_no }
    })

    return tickets
  }
}