import { Database } from './database-types'

/**
 * Issues a warning to the console if the read environment variable is empty or undefined.
 * @param readValue The value of the read environment variable (from `process.env`)
 * @param envVariableName The name of the environment variable expected in the `.env` file
 * @param envFilePath The path to the `.env` file in question
 * @param defaultValue The value that the variable should take on if empty or undefined
 * @param breaksIfUnset Whether functionality will definitely break if the default value is used
 * @returns `defaultValue` if `readValue` is empty or undefined, otherwise `readValue`
 */
export function defaultEnvironmentVariableWithWarning(
  readValue: string | undefined,
  envVariableName: string,
  envFilePath: string,
  defaultValue: string,
  breaksIfUnset: boolean,
): string {
  if (!readValue) {
    console.log(
      `WARNING: ${envVariableName} environment variable not set in '${envFilePath}', defaulting to '${defaultValue}'${breaksIfUnset ? ', which will not work' : ''}!`,
    )
    return defaultValue
  }
  return readValue
}

export type UserType = Database['public']['Tables']['User']['Row']['userType']

export interface TwilioIdentityInfo {
  userId: string
  userType: UserType
}

export function twilioIdentityToInfo(identity: string): TwilioIdentityInfo {
  const split = identity.split(' ')
  return { userType: split[0] as UserType, userId: split[1] }
}

export function twilioIdentityFromInfo(info: TwilioIdentityInfo): string {
  return `${info.userType} ${info.userId}`
}
