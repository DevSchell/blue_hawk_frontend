import { useEffect, useState } from 'react'
import { useProfileCacheSync } from '../../../controllers/useMyProfile'
import { requestLogin } from '../../../models/loginPrompt'
import { OPEN_PROFILE_EVENT } from '../../../models/userProfile'
import { PublicProfileModal } from './PublicProfileModal'
import { onNavigation } from '../../layout/router'

/**
 * Fica na moldura do app: abre o perfil público quando algum nome (UserLink) é clicado,
 * e mantém o cache do próprio perfil em dia ao entrar.
 */
export function ProfileModalHost({ signedInAs }: { signedInAs: string | null }) {
  const [userId, setUserId] = useState<string | null>(null)
  useProfileCacheSync(signedInAs)

  // Trocar de tela (ex.: um jogo da estante do perfil) fecha o perfil
  useEffect(() => onNavigation(() => setUserId(null)), [])

  useEffect(() => {
    // Perfis são vistos por quem está logado: visitante é convidado a entrar
    const onOpen = (e: Event) => {
      if (!signedInAs) requestLogin()
      else setUserId((e as CustomEvent<{ userId: string }>).detail.userId)
    }
    window.addEventListener(OPEN_PROFILE_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_PROFILE_EVENT, onOpen)
  }, [signedInAs])

  if (!userId || !signedInAs) return null
  return <PublicProfileModal key={userId} userId={userId} onClose={() => setUserId(null)} />
}
