import {
  IsString,
} from "class-validator";


export class IssueTicketInput {
  @IsString()
  event?: string;

  @IsString()
  user_id: string;
}

export class MarkUsedTicketInputt {
  @IsString()
  code: string;
}