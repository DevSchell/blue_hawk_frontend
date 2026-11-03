import { useState, type FormEvent } from 'react'
import { ApiError } from '../models/services/apiClient'
import { authenticate, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN, register } from '../models/services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(name: string, email: string, password: string, confirmPassword: string) {
  if (!name) return 'Informe o seu nome.'
  if (name.length > NAME_MAX) return `O nome pode ter até ${NAME_MAX} caracteres.`
  if (!EMAIL_PATTERN.test(email)) return 'Informe um e-mail válido.'
  if (password.length < PASSWORD_MIN) return `A senha precisa de pelo menos ${PASSWORD_MIN} caracteres.`
  if (password.length > PASSWORD_MAX) return `A senha pode ter até ${PASSWORD_MAX} caracteres.`
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Já existe uma conta com esse e-mail. Tente entrar.'
    if (error.status === 400) return 'Confira os dados: nome, e-mail válido e senha de 8 a 72 caracteres.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/**
 * Formulário de cadastro: cria a conta (POST /users) e já entra com ela
 * (POST /users/authenticate), porque o cadastro não devolve token.
 */
export function useRegisterController(onRegister: (email: string, token: string) => void) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const invalid = validate(cleanName, cleanEmail, password, confirmPassword)
    if (invalid) {
      setError(invalid)
      return
    }

    setIsLoading(true)
    try {
      await register(cleanName, cleanEmail, password)
    } catch (err) {
      setError(errorMessage(err))
      setIsLoading(false)
      return
    }

    try {
      const { accessToken } = await authenticate(cleanEmail, password)
      onRegister(cleanEmail, accessToken)
    } catch {
      // A conta existe; só o login automático falhou
      setError('Conta criada, mas não conseguimos entrar agora. Tente entrar com o seu e-mail.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    submit,
  }
}
