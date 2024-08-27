import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RewriteUrlModule } from "src/rewrite_url/rewrite_url.module";
import { Event, EventSchema } from "./event.schema";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { TicketModule } from "src/ticket/ticket.module";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: _.snakeCase(Event.name),
        useFactory: () => {
          const schema = EventSchema;
          return schema;
        },
      },
    ]),
    RewriteUrlModule,
    TicketModule
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule { }
