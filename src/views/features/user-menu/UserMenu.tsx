import { useUserMenuController } from '../../../controllers/useUserMenuController'
import type { Session } from '../../../models/session'
import { Avatar } from '../../components/Avatar/Avatar'
import { Raven } from '../../components/Brand/Raven'
import { Wordmark } from '../../components/Brand/Wordmark'
import { Button } from '../../components/Button/Button'
import { Drawer } from '../../components/Drawer/Drawer'
import { IconButton } from '../../components/IconButton/IconButton'
import {
  CloseIcon,
  GamesIcon,
  LogoutIcon,
  MatchesIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from '../../components/Icons/Icons'
import { MenuItem, MenuList } from '../../components/MenuList/MenuList'
import { Switch } from '../../components/Switch/Switch'
import './UserMenu.css'

const SOON = 'Em breve'

type UserMenuProps = {
  session: Session | null
  onSignIn: () => void
  onSignOut: () => void
}

/** Botão da topbar + menu lateral. Deslogado, mostra só "Cadastrar/Entrar". */
export function UserMenu({ session, onSignIn, onSignOut }: UserMenuProps) {
  const { isDarkTheme, toggleTheme, isOpen, openMenu, closeMenu, signIn, signOut } = useUserMenuController({
    onSignIn,
    onSignOut,
  })

  return (
    <>
      <IconButton
        label={session ? `Abrir menu de ${session.name}` : 'Abrir menu do usuário'}
        aria-haspopup="dialog"
        onClick={openMenu}
      >
        {session ? <Avatar name={session.name} /> : <UserIcon />}
      </IconButton>

      <Drawer open={isOpen} onClose={closeMenu} label="Menu do usuário">
        <div className="user-menu__header">
          <Raven variant="noite" />
          <Wordmark size="sm" />
          <IconButton label="Fechar menu" variant="ghost" className="user-menu__close" onClick={closeMenu}>
            <CloseIcon />
          </IconButton>
        </div>

        {session ? (
          <>
            <div className="user-menu__profile">
              <Avatar name={session.name} size="lg" />
              <div>
                <small>Olá,</small>
                <b>{session.name}</b>
              </div>
            </div>

            {/* Ainda sem páginas: os itens aparecem, mas não abrem nada */}
            <MenuList label="Sua conta">
              <MenuItem icon={<UserIcon />} label="Meu Perfil" hint={SOON} disabled />
              <MenuItem icon={<GamesIcon />} label="Meus Jogos" hint={SOON} disabled />
              <MenuItem icon={<MatchesIcon />} label="Minhas Partidas" hint={SOON} disabled />
              <MenuItem icon={<SettingsIcon />} label="Configurações" hint={SOON} disabled />
              <MenuItem icon={<LogoutIcon />} label="Sair" onClick={signOut} />
            </MenuList>

            <div className="user-menu__theme">
              {isDarkTheme ? <MoonIcon /> : <SunIcon />}
              <span id="user-menu-theme-label">Modo escuro</span>
              <Switch checked={isDarkTheme} onChange={toggleTheme} labelledBy="user-menu-theme-label" />
            </div>
          </>
        ) : (
          <div className="user-menu__signin">
            <Button fullWidth onClick={signIn}>
              Cadastrar/Entrar
            </Button>
          </div>
        )}
      </Drawer>
    </>
  )
}
