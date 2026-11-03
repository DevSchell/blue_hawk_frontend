import { apiPost } from './apiClient'

/** AuthenticateUserOutput da API (application/dto/user/AuthenticateUserOutput.java) */
type AuthenticateResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}

/** POST /users/authenticate com { email, password } */
export function authenticate(email: string, password: string) {
  return apiPost<AuthenticateResponse>('/users/authenticate', { email, password })
}
