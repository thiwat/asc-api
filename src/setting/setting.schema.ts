import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema, BaseSchemaFactory } from "src/common/base/base.schema";

@Schema({
  strict: false
})
export class Setting extends BaseSchema {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  key: String;
}

export const SettingSchema = BaseSchemaFactory.createForClass(Setting);
SettingSchema.index({ type: 1, key: 1 }, { unique: true });
