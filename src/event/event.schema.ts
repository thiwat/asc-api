import * as mongoose from 'mongoose'
import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class Event extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({})
  description: string;

  @Prop({})
  location: string;

  @Prop({})
  detail: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  cover: any;

  @Prop()
  number_of_seat: number;

  @Prop()
  number_of_sold: number;

  @Prop()
  price: number;

  @Prop()
  sale_start_date: Date;

  @Prop()
  sale_end_date: Date;

  @Prop()
  event_start_date: Date;

  @Prop()
  event_end_date: Date;

  @Prop({})
  url_path: string;
}

export const EventSchema = BaseSchemaFactory.createForClass(Event);
EventSchema.index({ code: 1 }, { unique: true })
