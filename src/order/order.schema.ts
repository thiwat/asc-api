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
export class Order extends BaseSchema {
  @Prop({ required: true })
  order_no: string;

  @Prop({ required: true })
  user_id: string;

  @Prop()
  user_name: string;

  @Prop({})
  event: string;

  @Prop({})
  status: string;

  @Prop({})
  quantity: number;

  @Prop({})
  total_amount: number;

  @Prop()
  slip_url: string;

  @Prop()
  qrcode: string;

  @Prop()
  paid_date?: Date;
}

export const OrderSchema = BaseSchemaFactory.createForClass(Order);
OrderSchema.index({ order_no: 1 }, { unique: true })
