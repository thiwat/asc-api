require('dotenv').config();
import * as Queue from 'bull';
import { Logger } from 'winston';
import logger from './logger';
import { getRedisOpts } from './redis';

const CHECK_SCHEDULE_INTERVAL = 60 * 1000

class QueueService<T> {
  protected _queue: Queue.Queue;
  protected _queueName: string;

  constructor(queueName: string) {
    this._queueName = queueName
    this._queue = new Queue(queueName, {
      redis: getRedisOpts(process.env.QUEUE_REDIS_URL)
    });
  }

  add(data: T) {
    this._queue.add('queue', data, {
      removeOnComplete: true,
      removeOnFail: true
    });
  }
}

class ScheduleQueueService<T> extends QueueService<T> {
  private _name: string;
  private _cron: string;
  private logger: Logger
  constructor(
    queueName: string,
    cron: string
  ) {
    super(queueName)
    this._cron = cron
    this._name = queueName
    this._initialProcess()
    setInterval(async () => {
      this._checkProcessExists()
    }, CHECK_SCHEDULE_INTERVAL)
    this.logger = logger.child({ service: this.constructor.name, queue: queueName })
  }

  private _initialProcess = async () => {
    const jobs = await this._queue.getRepeatableJobs()
    const exists = jobs
      .find(i => i.id === this._name)
    if (exists) {
      this.logger.info('Remove schedule job')
      this._queue.removeRepeatableByKey(exists.key)
    }
    this.add({} as T)
  }

  private _checkProcessExists = async () => {
    const jobs = await this._queue.getRepeatableJobs()
    const exists = jobs
      .find(i => i.id === this._name)
    if (!exists) {
      this.logger.info('Initial schedule')
      this.add({} as T)
    }
  }

  add(data: T) {
    this._queue.add('queue', data, {
      removeOnComplete: true,
      removeOnFail: true,
      jobId: this._name,
      repeat: {
        cron: this._cron
      }
    })
  }
}

export const dashboardSchedule = new ScheduleQueueService('dashboard_schedule', '5 */15 * * * *')