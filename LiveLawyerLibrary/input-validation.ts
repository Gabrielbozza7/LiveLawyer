export function validateEmail(input: string): boolean {
  return input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? true : false
}

export function validatePassword(input: string): boolean {
  return input.length >= 8
}
