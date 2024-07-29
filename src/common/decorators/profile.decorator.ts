import * as _ from 'lodash'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Profile = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const profile = _.get(request, 'session.profile', {})

    return field
      ? profile?.[field]
      : profile
  }
);