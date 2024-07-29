import * as _ from "lodash";

import { Module } from "@nestjs/common";
import { LineService } from "./line.service";


@Module({
  imports: [],
  controllers: [],
  providers: [LineService],
  exports: [LineService]
})
export class LineModule { }
