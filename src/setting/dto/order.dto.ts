import {
  IsString,
} from "class-validator";


export class OrderSettings {
  @IsString()
  running_format: string;

  @IsString()
  account_no: string;
}