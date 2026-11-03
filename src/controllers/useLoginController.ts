import { useState, type FormEvent } from 'react'
import { ApiError } from '../models/services/apiClient'
import { authenticate } from '../models/services/authService'

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401) return 'E-mail ou senha inválidos.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/** Formulário de login: campos, validação e chamada a POST /users/authenticate. */
export function useLoginController(onLogin: (email: string, token: string) => void) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Por favor, informe o e-mail.')
      return
    }
    if (!password) {
      setError('Por favor, insira a sua senha.')
      return
    }

    setIsLoading(true)
    try {
      const { accessToken } = await authenticate(email.trim(), password)
      onLogin(email.trim(), accessToken)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    isLoading,
    error,
    submit,
  }
}
