export function validateEmail(input: string): boolean {
  return input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? true : false
}

export function validatePassword(input: string): boolean {
  return input.length >= 8
}

export function validatePhoneNumber(input: string): boolean {
  // This regex has been restricted a bit to force the minumum length of a US phone number.
  return input.match(/^\+[1-9]\d{7,14}$/) ? true : false
}

export function notEmpty(input: string): boolean {
  return input.length > 0
}
