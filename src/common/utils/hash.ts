import { createHash } from 'crypto'

export const generateHash = (value: string, salt: string) => {
  return createHash('sha256')
    .update(`${value}:${salt || 'DEFAULT_SALT'}`)
    .digest('hex')
}