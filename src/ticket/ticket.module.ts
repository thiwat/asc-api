import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventModule } from "src/event/event.module";
import { Ticket, TicketSchema } from "./ticket.schema";
import { TicketController } from "./ticket.controller";
import { TicketService } from "./ticket.service";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Ticket.name),
        useFactory: () => {
          const schema = TicketSchema;
          return schema;
        },
      },
    ]),
    EventModule
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService]
})
export class TicketModule { }
