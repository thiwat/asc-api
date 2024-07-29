import * as mongoose from 'mongoose';
import * as _ from 'lodash';

mongoose.connect(process.env.MONGODB_URI);

const Counter = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  prefix: { type: String },
  counter: { type: Number }
});

const CounterModel = mongoose.model('counter', Counter);

export const generateRunningNumber = async (code: string, prefix: string, length?: number) => {
  prefix = prefix.toUpperCase();
  const res = await CounterModel.findOneAndUpdate(
    { code },
    [
      {
        '$addFields': {
          prefix,
          counter: {
            '$cond': [
              { '$eq': ['$prefix', prefix] },
              { $add: ['$counter', 1] },
              1
            ]
          }
        }
      }
    ],
    { new: true, upsert: true }
  );

  return `${prefix}${_.padStart(res.counter, length || 4, '0')}`;
};