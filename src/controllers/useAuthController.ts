import { useEffect, useState } from 'react'
import { likesStore } from '../models/likesStore'
import { getUser } from '../models/services/accountService'
import { clearSession, readSession, readUserId, saveSession, updateStoredProfile, type Session } from '../models/session'

/** O login só devolve o token: busca o nome e o e-mail reais do usuário */
function syncProfile(setSession: (session: Session) => void) {
  const id = readUserId()
  if (!id) return
  getUser(id)
    .then((user) => {
      const session = updateStoredProfile(user.name, user.email)
      if (session) setSession(session)
    })
    .catch(() => undefined)
}

/** Sessão do app inteiro: quem está logado e se o login ou cadastro estão abertos. */
export function useAuthController() {
  const [session, setSession] = useState<Session | null>(readSession)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // A API recusou o token (expirou ou foi invalidado): volta a visitante e pede o login
  useEffect(() => {
    const onExpired = () => {
      setSession(null)
      setIsLoginOpen(true)
    }
    window.addEventListener('bluehawk:session-expired', onExpired)
    return () => window.removeEventListener('bluehawk:session-expired', onExpired)
  }, [])

  // Sessão guardada de uma visita anterior: confere o nome com a API
  useEffect(() => {
    if (readSession()) syncProfile(setSession)
  }, [])

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
      syncProfile(setSession)
      setIsLoginOpen(false)
      setIsRegisterOpen(false)
    },
    /** Nome ou e-mail alterados no perfil */
    updateProfile: (name: string, email: string) => {
      const session = updateStoredProfile(name, email)
      if (session) setSession(session)
    },
    logout: () => {
      likesStore.clear()
      clearSession()
      setSession(null)
    },
  }
}
