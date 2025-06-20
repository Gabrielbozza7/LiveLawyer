export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseFailure

export interface ApiResponseSuccess<T> {
  success: true
  result: T
}

export interface ApiResponseFailure {
  success: false
  error: string
}

export type WithAccessToken<T> = T & { accessToken: string }
