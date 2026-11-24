import type { ReactNode } from 'react'
import type { Session } from '../../models/session'
import { Logo } from '../components/Brand/Logo'
import { RavenSymbols } from '../components/Brand/Raven'
import { ChatButton } from '../features/chats/ChatButton'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { ProfileModalHost } from '../features/profile/ProfileModalHost'
import { UserMenu } from '../features/user-menu/UserMenu'
import { Footer } from './Footer'
import { MainNav } from './MainNav'
import { Topbar } from './Topbar'

type AppLayoutProps = {
  session: Session | null
  onSignIn: () => void
  onSignOut: () => void
  children: ReactNode
}

/** Moldura comum das páginas: topbar com logo, navegação e menu do usuário, conteúdo e rodapé */
export function AppLayout({ session, onSignIn, onSignOut, children }: AppLayoutProps) {
  return (
    <>
      <RavenSymbols />
      <Topbar>
        <Logo variant="noite" />
        <MainNav />
        <div className="topbar__end">
          {/* key: trocar de conta zera os contadores */}
          <ChatButton key={`chat-${session?.email ?? 'visitante'}`} signedIn={Boolean(session)} />
          <NotificationBell key={session?.email ?? 'visitante'} signedIn={Boolean(session)} />
          <UserMenu session={session} onSignIn={onSignIn} onSignOut={onSignOut} />
        </div>
      </Topbar>
      {children}
      {/* Perfil público de quem aparecer nas ofertas e conversas */}
      <ProfileModalHost signedInAs={session?.email ?? null} />
      <Footer />
    </>
  )
}
