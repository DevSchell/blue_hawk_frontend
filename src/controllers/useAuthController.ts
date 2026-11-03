import { useState } from 'react'
import { clearSession, readSession, saveSession, type Session } from '../models/session'

/** Sessão do app inteiro: quem está logado e se o login ou cadastro estão abertos. */
export function useAuthController() {
  const [session, setSession] = useState<Session | null>(readSession)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return {
    session,
    isLoginOpen,
    isRegisterOpen,
    openLogin: () => {
      setIsRegisterOpen(false)
      setIsLoginOpen(true)
    },
    closeLogin: () => setIsLoginOpen(false),
    openRegister: () => {
      setIsLoginOpen(false)
      setIsRegisterOpen(true)
    },
    closeRegister: () => setIsRegisterOpen(false),
    /** Chamado pelo login ou cadastro depois que a API aceita e-mail e senha */
    completeLogin: (email: string, token: string) => {
      setSession(saveSession(email, token))
      setIsLoginOpen(false)
      setIsRegisterOpen(false)
    },
    logout: () => {
      clearSession()
      setSession(null)
    },
  }
}
