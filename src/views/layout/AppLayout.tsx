import type { ReactNode } from 'react'
import { Logo } from '../components/Brand/Logo'
import { RavenSymbols } from '../components/Brand/Raven'
import { UserMenu } from '../features/user-menu/UserMenu'
import { Footer } from './Footer'
import { Topbar } from './Topbar'

/** Moldura comum das páginas: topbar com menu do usuário e logo, conteúdo e rodapé */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RavenSymbols />
      <Topbar>
        <UserMenu />
        <Logo variant="noite" />
      </Topbar>
      {children}
      <Footer />
    </>
  )
}
