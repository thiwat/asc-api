import * as randomstring from 'randomstring'

export const randomString = (length: number, onlyNumber?: boolean): string => {
  return randomstring.generate({
    length,
    charset: onlyNumber
      ? 'numeric'
      : 'alphanumeric'
  });
}