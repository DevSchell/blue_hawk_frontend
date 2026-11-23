import { useUserMenuController } from '../../../controllers/useUserMenuController'
import type { Session } from '../../../models/session'
import { Avatar } from '../../components/Avatar/Avatar'
import { Raven } from '../../components/Brand/Raven'
import { Wordmark } from '../../components/Brand/Wordmark'
import { Button } from '../../components/Button/Button'
import { Drawer } from '../../components/Drawer/Drawer'
import { IconButton } from '../../components/IconButton/IconButton'
import {
  CameraIcon,
  CloseIcon,
  GamesIcon,
  LogoutIcon,
  MatchesIcon,
  MoonIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SunIcon,
  UserIcon,
} from '../../components/Icons/Icons'
import { MenuItem, MenuList } from '../../components/MenuList/MenuList'
import { ACCOUNT_ROUTES, MY_MATCHES_PATH, REVIEW_PATH } from '../../layout/navigation'
import { Switch } from '../../components/Switch/Switch'
import './UserMenu.css'

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
            <a
              href={ACCOUNT_ROUTES.profilePhoto}
              className="user-menu__profile-link"
              title="Ir para edição de foto"
              onClick={closeMenu}
            >
              <Avatar name={session.name} size="lg" />
              <div className="user-menu__profile-meta">
                <small>Olá,</small>
                <b>{session.name}</b>
                <span className="user-menu__edit-photo-hint">
                  <CameraIcon />
                  Editar foto
                </span>
              </div>
            </a>

            <MenuList label="Sua conta">
              <MenuItem icon={<UserIcon />} label="Meu Perfil" href={ACCOUNT_ROUTES.profile} onClick={closeMenu} />
              <MenuItem
                icon={<CameraIcon />}
                label="Editar Foto"
                href={ACCOUNT_ROUTES.profilePhoto}
                onClick={closeMenu}
              />
              <MenuItem icon={<GamesIcon />} label="Meus Jogos" href={ACCOUNT_ROUTES.shelf} onClick={closeMenu} />
              {/* "Minhas Partidas" é a aba do Jogue */}
              <MenuItem icon={<MatchesIcon />} label="Minhas Partidas" href={MY_MATCHES_PATH} onClick={closeMenu} />
              {session.isAdmin && (
                <MenuItem icon={<ShieldCheckIcon />} label="Aprovar jogos" href={REVIEW_PATH} onClick={closeMenu} />
              )}
              <MenuItem icon={<SettingsIcon />} label="Configurações" href={ACCOUNT_ROUTES.settings} onClick={closeMenu} />
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
