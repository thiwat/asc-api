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

export class UploadSlipInput {
  @IsString()
  order_no: string;

  @IsString()
  slip_url: string;
}

export class ApprovePaymentInput {
  @IsString()
  order_no: string;
}