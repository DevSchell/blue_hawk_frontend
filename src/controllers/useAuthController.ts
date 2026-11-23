import { useState } from 'react'
import { likesStore } from '../models/likesStore'
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
      // Curtidas marcadas eram de quem estava antes (ou de ninguém): passam a vir da API de novo
      likesStore.clear()
      setSession(saveSession(email, token))
      setIsLoginOpen(false)
      setIsRegisterOpen(false)
    },
    logout: () => {
      likesStore.clear()
      clearSession()
      setSession(null)
    },
  }
}
