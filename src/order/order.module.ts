import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RewriteUrlModule } from "src/rewrite_url/rewrite_url.module";
import { Order, OrderSchema } from "./order.schema";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { EventModule } from "src/event/event.module";


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
    EventModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
