import { apiPost } from './apiClient'

/** AuthenticateUserOutput da API (application/dto/user/AuthenticateUserOutput.java) */
type AuthenticateResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}

/** UserOutput da API (application/dto/user/UserOutput.java) */
type UserResponse = {
  id: string
  name: string
  email: string
  role: string
}

/** Limites do CreateUserCommand da API */
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72
export const NAME_MAX = 150

/** POST /users/authenticate com { email, password } */
export function authenticate(email: string, password: string) {
  return apiPost<AuthenticateResponse>('/users/authenticate', { email, password })
}

/** POST /users com { name, email, password }. Não devolve token: o login vem depois. */
export function register(name: string, email: string, password: string) {
  return apiPost<UserResponse>('/users', { name, email, password })
}
