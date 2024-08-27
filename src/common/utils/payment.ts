import { crc16xmodem } from 'crc'
import * as QRCode from 'qrcode'

const VERSION_POS = '00'
const TYPE_POS = '01'
const MERCHANT_POS = '29'
const CURRENCY_POS = '53'
const AMOUNT_POS = '54'
const LOCALE_POS = '58'
const CHECK_SUM_POS = '63'

const VERSION = '01'
const PAY_TYPE = '11'
const AID = 'A000000677010111'
const MOBILE_TYPE = '01'
const CITIZEN_TYPE = '02'
const CURRENCY = '764'
const LOCALE = 'TH'

const formatValue = (id: string, value: string): string => {
  return `${id}${('00' + value.length).slice(-2)}${value}`
}

const formatTarget = (target: string): string => {
  let result = '0016' + AID
  if (target.length >= 15) {
    result += `${target.length}${target}`
  } else if (target.length >= 13) {
    result += `${CITIZEN_TYPE}13${target}`
  } else {
    result += `${MOBILE_TYPE}13${('00' + target)}`
  }
  return result
}

const checksum = (data: string): string => {
  const checksum = crc16xmodem(data, '0xffff')
  return ('0000' + checksum.toString(16).toUpperCase()).slice(-4)
}

export const generatePromptPay = async (accountId: string, amount: number): Promise<string> => {
  const data = [
    formatValue(VERSION_POS, VERSION),
    formatValue(TYPE_POS, PAY_TYPE),
    formatValue(MERCHANT_POS, formatTarget(accountId)),
    formatValue(CURRENCY_POS, CURRENCY),
    formatValue(LOCALE_POS, LOCALE),
    formatValue(AMOUNT_POS, `${amount}`),
  ]
  data.push(
    formatValue(
      CHECK_SUM_POS,
      checksum(
        `${data.join('')}${CHECK_SUM_POS}04`
      )
    )
  )
  return await QRCode.toDataURL(data.join(''))
}