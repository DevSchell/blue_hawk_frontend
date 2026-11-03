import type { ReactNode } from 'react'
import type { Session } from '../../models/session'
import { Logo } from '../components/Brand/Logo'
import { RavenSymbols } from '../components/Brand/Raven'
import { UserMenu } from '../features/user-menu/UserMenu'
import { Footer } from './Footer'
import { Topbar } from './Topbar'

type AppLayoutProps = {
  session: Session | null
  onSignIn: () => void
  onSignOut: () => void
  children: ReactNode
}

/** Moldura comum das páginas: topbar com menu do usuário e logo, conteúdo e rodapé */
export function AppLayout({ session, onSignIn, onSignOut, children }: AppLayoutProps) {
  return (
    <>
      <RavenSymbols />
      <Topbar>
        <UserMenu session={session} onSignIn={onSignIn} onSignOut={onSignOut} />
        <Logo variant="noite" />
      </Topbar>
      {children}
      <Footer />
    </>
  )
}
