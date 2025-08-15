import {
  IsString,
} from "class-validator";


export class IssueTicketInput {
  @IsString()
  user: string;
}

export class MarkUsedTicketInputt {
  @IsString()
  code: string;
}