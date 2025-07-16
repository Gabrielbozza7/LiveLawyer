export function validateEmail(input: string): boolean {
  return input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? true : false
}

export function validatePassword(input: string): boolean {
  return input.length >= 8
}

export function validatePhoneNumber(input: string): boolean {
  // General E.164 regex: /^\+[1-9]\d{1,14}$/
  // This regex has been restricted a bit to force the minumum length of a US phone number.
  return ('+1' + input.replace(/[() -]/g, '')).match(/^\+1\d{10}$/) ? true : false
}

export function notEmpty(input: string): boolean {
  return input.length > 0
}
