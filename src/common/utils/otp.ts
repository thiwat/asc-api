import * as _ from 'lodash'
import { SecuritySetting } from 'src/setting/dto/security.dto'
import { throwError } from './error'
import { generateOtpKey } from "./key"
import { randomString } from "./random"
import { redisCache } from "./redis"

export const REF_LENGTH = 4
export const OTP_LENGTH = 6

const OTP_TTL = 60 * 10 // 10 minutes

type GenerateOtpOutput = {
  ref: string;
  otp: string;
  data?: any;
}

export const generateOtp = async (data: any): Promise<GenerateOtpOutput> => {
  const ref = randomString(REF_LENGTH)
  const otp = randomString(OTP_LENGTH, true)

  await redisCache.set(
    generateOtpKey(ref),
    {
      otp,
      data
    },
    OTP_TTL
  )

  return {
    ref,
    otp
  }
}

export const resendOtp = async (oldRef: string): Promise<GenerateOtpOutput> => {
  const redisData = await redisCache.get(generateOtpKey(oldRef))

  if (_.isEmpty(redisData)) {
    return throwError(
      'Invalid OTP Ref',
      'invalid_otp_ref'
    )
  }

  const ref = randomString(REF_LENGTH)
  const otp = randomString(OTP_LENGTH, true)

  await redisCache.set(
    generateOtpKey(ref),
    {
      otp,
      data: redisData.data
    },
    OTP_TTL
  )

  return { ref, otp, data: redisData.data }

}

export const validateOtp = async (
  otpInput: string,
  settings?: SecuritySetting
): Promise<{ data: unknown }> => {
  const [ref, otp] = otpInput.split('-')

  const redisData = await redisCache.get(
    generateOtpKey(ref)
  )

  if (_.isEmpty(redisData)) {
    return throwError(
      'Invalid OTP',
      'invalid_otp'
    )
  }

  const otpList = settings?.otp?.enable_universal_otp
    ? [otp, ...(settings?.otp?.universal_otp || [])]
    : [otp]

  if (!otpList.includes(otp)) {
    return throwError(
      'Invalid OTP',
      'invalid_otp'
    )
  }

  redisCache.del(generateOtpKey(ref))

  return { data: redisData.data }
}