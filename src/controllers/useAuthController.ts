import { useState } from 'react'
import { clearSession, readSession, saveSession, type Session } from '../models/session'

/** Sessão do app inteiro: quem está logado e se o login está aberto. */
export function useAuthController() {
  const [session, setSession] = useState<Session | null>(readSession)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return {
    session,
    isLoginOpen,
    openLogin: () => setIsLoginOpen(true),
    closeLogin: () => setIsLoginOpen(false),
    /** Chamado pelo login depois que a API aceita e-mail e senha */
    completeLogin: (email: string, token: string) => {
      setSession(saveSession(email, token))
      setIsLoginOpen(false)
    },
    logout: () => {
      clearSession()
      setSession(null)
    },
  }
}
