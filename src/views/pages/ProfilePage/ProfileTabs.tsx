import type { ReactNode } from 'react'
import {
  CameraIcon,
  LogoutIcon,
  MoonIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserIcon,
} from '../../components/Icons/Icons'
import { PROFILE_TAB_GROUPS, type ProfileTabId } from './profileUtils'

export type { ProfileTabId }

const TAB_INFO: Record<ProfileTabId, { label: string; icon: ReactNode }> = {
  dados: { label: 'Dados pessoais', icon: <UserIcon /> },
  foto: { label: 'Foto', icon: <CameraIcon /> },
  atividades: { label: 'Atividades', icon: <TrophyIcon /> },
  preferencias: { label: 'Preferências', icon: <SettingsIcon /> },
  aparencia: { label: 'Aparência', icon: <MoonIcon /> },
  senha: { label: 'Senha', icon: <ShieldCheckIcon /> },
  conta: { label: 'Excluir conta', icon: <LogoutIcon /> },
}

type ProfileTabsProps = {
  activeTab: ProfileTabId
  onSelectTab: (tab: ProfileTabId) => void
}

/** Menu lateral do perfil: grupos "Seu perfil" e "Configurações" (vira uma faixa rolável no celular) */
export function ProfileTabs({ activeTab, onSelectTab }: ProfileTabsProps) {
  return (
    <nav className="profile-nav" aria-label="Seções do perfil">
      {PROFILE_TAB_GROUPS.map((group) => (
        <div key={group.label} className="profile-nav__group">
          <span className="profile-nav__group-label">{group.label}</span>
          <div role="tablist" aria-orientation="vertical" aria-label={group.label} className="profile-nav__tabs">
            {group.tabs.map((id) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  className={isActive ? 'profile-nav__tab is-active' : 'profile-nav__tab'}
                  onClick={() => onSelectTab(id)}
                >
                  {TAB_INFO[id].icon}
                  <span>{TAB_INFO[id].label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
