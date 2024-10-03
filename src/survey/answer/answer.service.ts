import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/base.service";
import { InjectModel } from '@nestjs/mongoose';
import { SurveyAnswer } from './answer.schema';
import { Profile } from 'src/common/dto/profile.dto';
import { UserService } from 'src/user/user.service';
import { SurveyService } from '../survey.service';
// import { notificationQueue } from 'src/common/utils/queue';
// import { NotificationProvider } from 'src/common/enums/notification_provider.enum';
import { throwError } from 'src/common/utils/error';
import { v4 as uuid } from 'uuid';
// import { formatSurveyAnswer } from 'src/common/utils/template';

@Injectable()
export class SurveyAnswerService extends BaseService<SurveyAnswer> {
  constructor(
    private userService: UserService,
    private surveyService: SurveyService,
    @InjectModel(_.snakeCase(SurveyAnswer.name))
    protected model: mongoose.Model<SurveyAnswer>,
  ) {
    super(model);
  }

  public async findByCode(code: string): Promise<SurveyAnswer> {
    const res = await this.find({ code })

    if (_.isEmpty(res)) {
      throwError('Permission Denied', 'permission_denied')
    }

    return res
  }

  public async submit(data: any, profile: Profile): Promise<SurveyAnswer> {

    const user = profile?.user_id
      ? await this.userService.findByUserId(profile.user_id)
      : { user_id: uuid(), full_name: 'Guest' }
    const survey = await this.surveyService.findByCode(data['code'])

    data['survey'] = data['code']
    data['survey_name'] = survey.name
    data['user_id'] = user?.user_id
    data['user_name'] = `${user.full_name}`

    data['code'] = `${data['code']}_${user.user_id}`

    const surveyUser: any = {}

    for (const ans of (data.answers || [])) {

      if (ans.code === 'email') surveyUser['email'] = ans.value
      if (ans.code === 'name') surveyUser['name'] = ans.value
      if (ans.code === 'mobile') surveyUser['mobile'] = ans.value

      const question = survey.questions.find(i => i.code === ans.code)
      ans['label'] = question.label
      ans['value_label'] = ans.value

      if (question.type !== 'radio') continue

      const option = question.options.find(i => i.value === ans.value)
      ans['value_label'] = option?.label
    }

    // notificationQueue.add({
    //   provider: NotificationProvider.line,
    //   template: 'pending_lead',
    //   send_to: '',
    //   data: { user, survey }
    // })

    // survey.send_email && !!surveyUser?.email && notificationQueue.add({
    //   provider: NotificationProvider.email,
    //   template: 'submit_survey',
    //   send_to: surveyUser.email,
    //   data: { user: surveyUser, survey, answers: formatSurveyAnswer(data.answers) }
    // })

    return super.create(data)
  }
}