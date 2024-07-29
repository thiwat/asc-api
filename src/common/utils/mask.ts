import * as _ from 'lodash'

const masking = (
  text: string,
  start: number,
  end: number,
  maskWith: string,
  totalMask: number
) => {
  const a = text.substring(0, start)
  const b = maskWith.repeat(totalMask)
  const c = text.substring(text.length - end)
  return a + b + c
}

export const replace = (obj: any, keys: string[]) => {
  if (typeof obj === 'object') {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        replace(obj[key], keys);
      } else {
        if (keys.includes(key)) {
          obj[key] = masking(obj[key], 2, 1, '*', 5)
        }
      }
    }
  }
  return obj
}

const mask = (value: string): string => {
  if (!value) return ''
  return `${value.slice(0, 4)}${'*'.repeat(value.length - 6)}${value.slice(-2)}`
}

export const maskData = (maskField?: string[]) => (data: any): any => {
  if (data?.rows) {
    data['rows'] = data['rows']
      .map(i => {
        for (const field of maskField) {
          i[field] = mask(i[field])
        }
        return i
      })
  }

  for (const field of maskField) {
    data[field] = mask(data[field])
  }
  return data
}

export const hideFields = (fields?: string[]) => (data: any): any => {
  if (data?.rows) {
    data['rows'] = data['rows']
      .map(i => {
        return _.omit(i, fields)
      })
  }

  return _.omit(data, fields)
}