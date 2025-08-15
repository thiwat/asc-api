import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./order.schema";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TicketModule } from "src/ticket/ticket.module";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Order.name),
        useFactory: () => {
          const schema = OrderSchema;
          return schema;
        },
      },
    ]),
    TicketModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
