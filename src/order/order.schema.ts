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

  @Prop({})
  event: string;

  @Prop({})
  status: string;

  @Prop({})
  quantity: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  slip_url: any;
}

export const OrderSchema = BaseSchemaFactory.createForClass(Order);
OrderSchema.index({ order_no: 1 }, { unique: true })
