import type { ReactNode } from 'react'
import { CameraIcon, SettingsIcon, TrophyIcon, UserIcon } from '../../components/Icons/Icons'
import type { ProfileTabId } from './profileUtils'

export type { ProfileTabId }

type TabItem = {
  id: ProfileTabId
  label: string
  icon: ReactNode
}

const TABS: TabItem[] = [
  { id: 'dados', label: 'Dados Pessoais', icon: <UserIcon /> },
  { id: 'foto', label: 'Editar Foto', icon: <CameraIcon /> },
  { id: 'atividades', label: 'Atividades & Estatísticas', icon: <TrophyIcon /> },
  { id: 'preferencias', label: 'Preferências', icon: <SettingsIcon /> },
]

type ProfileTabsProps = {
  activeTab: ProfileTabId
  onSelectTab: (tab: ProfileTabId) => void
}

export function ProfileTabs({ activeTab, onSelectTab }: ProfileTabsProps) {
  return (
    <nav className="profile-nav-tabs" role="tablist" aria-label="Seções do perfil">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            className={`profile-nav-tab ${isActive ? 'profile-nav-tab--active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
