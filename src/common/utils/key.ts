export const generateTokenKey = (token: string): string => {
  return `TOKEN_${token}`
}

export const generateRegisterKey = (token: string): string => {
  return `REGISTER_${token}`
}

export const generateOtpKey = (ref: string): string => {
  return `OTP_${ref}`
}

export const generateResetPasswordToken = (token: string): string => {
  return `RESET_PASSWORD_${token}`
}

export const generateSlugKey = (slug: string): string => {
  return `SLUG_${slug}`
}

export const generateActivateTokenKey = (token: string): string => {
  return `ACTIVATE_${token}`
}