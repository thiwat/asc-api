import * as _ from "lodash";
import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class BaseSchema extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  _translates?: any;
}

export class BaseSchemaFactory {
  public static createForClass(T): mongoose.Schema<any> {
    const schema = SchemaFactory.createForClass(T);
    schema.set("toJSON", {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        const decimal2Json = (v, i?: any, prev?: any, count: number = 0) => {
          if (count < 10 && v !== null && typeof v === "object") {
            if (_.get(v, "constructor.name") === "Decimal128")
              prev[i] = Math.round(parseFloat(v.toString()) * 100) / 100;
            else
              Object.entries(v).forEach(([key, value]) =>
                decimal2Json(value, key, prev ? prev[i] : v, count + 1)
              );
          }
        };
        delete ret._id;
        decimal2Json(ret);
        return ret;
      },
    });
    return schema;
  }
}
