import * as _ from 'lodash'

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { hideFields } from '../utils/mask';

@Injectable()
export class HideInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const fields = this.reflector.get<string[]>('hide_fields', context.getClass());

    if (_.isEmpty(fields)) return next.handle()

    return next
      .handle()
      .pipe(map(hideFields(fields)))
  }
}