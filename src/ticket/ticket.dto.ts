import {
  IsString,
} from "class-validator";


export class IssueTicketInput {
  @IsString()
  user: string;

  @IsString()
  order: string;
}

export class MarkUsedTicketInput {
  @IsString()
  code: string;
}