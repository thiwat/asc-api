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

  @Prop({ type: mongoose.Schema.Types.Mixed })
  user: any;

  @Prop({})
  status: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  items?: any;

  @Prop({})
  total_amount: number;

  @Prop()
  slip_url: string;

  @Prop()
  paid_date?: Date;
}

export const OrderSchema = BaseSchemaFactory.createForClass(Order);
OrderSchema.index({ order_no: 1 }, { unique: true })
