import * as _ from 'lodash'
import * as qs from 'qs'

export const convertFilter = (filters: string) => {
  let result = _.isEmpty(filters)
    ? {}
    : qs.parse(filters, { strictNullHandling: true });

  const _validateQueryFormat = query => {
    for (const key in query) {
      if (_.isArray(query[key])) {
        for (let obj of query[key]) {
          obj = _validateQueryFormat(obj);
        }
      } else if (_.isPlainObject(query[key])) {
        if (Object.keys(query[key])[0] === "0") {
          const temp = [];
          for (const key2 in query[key]) {
            temp.push(_validateQueryFormat(query[key][key2]));
          }
          query[key] = temp;
        } else {
          query[key] = _validateQueryFormat(query[key]);
        }
      }
    }
    return query;
  };
  result = _validateQueryFormat(result);
  return result;
};