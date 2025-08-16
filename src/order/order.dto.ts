import {
  IsObject,
  IsString,
} from "class-validator";


export class PlaceOrderInput {
  @IsObject()
  user?: any;

  @IsObject()
  items?: any;

  @IsString()
  slip_url?: string;
}

export class ApprovePaymentInput {
  @IsString()
  order_no: string;
}

export class UpdateOrderInput {
  @IsString()
  slip_url: string;
}

export class ListTicketsInput {
  @IsString()
  order_no: string;
}