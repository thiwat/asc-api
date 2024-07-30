import {
  IsPositive,
  IsString,
} from "class-validator";


export class PlaceOrderInput {
  @IsString()
  event?: string;

  @IsPositive()
  quantity?: number;
}