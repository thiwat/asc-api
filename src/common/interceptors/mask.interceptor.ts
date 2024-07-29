import * as _ from 'lodash'

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { maskData } from '../utils/mask';

@Injectable()
export class MaskInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ignore = this.reflector.get<boolean>('ignore_mask_fields', context.getHandler());
    const fields = this.reflector.get<string[]>('mask_fields', context.getClass());
    if (ignore) return next.handle()

    if (_.isEmpty(fields)) return next.handle()

    return next
      .handle()
      .pipe(map(maskData(fields)))
  }
}