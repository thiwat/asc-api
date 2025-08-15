import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: true,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class Ticket extends BaseSchema {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  user: string;

  @Prop({})
  event: string;

  @Prop({})
  status: string;

  @Prop()
  used_date?: Date;
}

export const TicketSchema = BaseSchemaFactory.createForClass(Ticket);
TicketSchema.index({ code: 1 }, { unique: true })
