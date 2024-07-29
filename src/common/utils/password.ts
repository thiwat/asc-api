import { AuthenticationPasswordPolicy } from "src/setting/dto/authentication.dto";

const MATCH_CASE = {
  lower_case: /(.*[a-z].*)/,
  upper_case: /(.*[A-Z].*)/,
  digit_case: /(.*\d.*)/,
  special_case: /(.*\W.*)/,
}

export const validatePasswordCase = (password: string, settings: AuthenticationPasswordPolicy): boolean => {
  for (const c of (settings?.password_case || [])) {
    if (!MATCH_CASE[c].test(password)) return false
  }
  return true
}

export const RESET_PASSWORD_TOKEN_LENGTH = 64