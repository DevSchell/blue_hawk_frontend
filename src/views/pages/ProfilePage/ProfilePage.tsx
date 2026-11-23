import { useEffect, useState } from 'react'
import { useAsyncList } from '../../../controllers/useAsyncList'
import { getUser, type User } from '../../../models/services/accountService'
import { readUserId } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Avatar } from '../../components/Avatar/Avatar'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { CameraIcon } from '../../components/Icons/Icons'
import { ProfileActivities } from './ProfileActivities'
import { ProfilePersonalData } from './ProfilePersonalData'
import { ProfilePhotoEditor } from './ProfilePhotoEditor'
import { ProfilePreferences } from './ProfilePreferences'
import { ProfileTabs } from './ProfileTabs'
import { resolveProfileTab, type ProfileTabId } from './profileUtils'
import '../FeedPage/FeedPage.css'
import '../AccountPages.css'
import './ProfilePage.css'

function getInitialTab(): ProfileTabId {
  return typeof window === 'undefined' ? 'dados' : resolveProfileTab(window.location.search)
}

type ProfilePageProps = {
  onSignIn: () => void
  onProfileChange: (name: string, email: string) => void
}

/** Meu Perfil: navegação por abas com Dados, Foto, Atividades e Preferências */
export function ProfilePage({ onSignIn, onProfileChange }: ProfilePageProps) {
  const userId = readUserId()
  const user = useAsyncList((signal) => (userId ? getUser(userId, signal) : Promise.resolve(null)))

  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">Meu Perfil</h1>
        {!userId ? (
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver o seu perfil">
            Seus dados ficam salvos na sua conta.
            <span className="shelf-empty__action">
              <Button onClick={onSignIn}>Entrar</Button>
            </span>
          </EmptyState>
        ) : user.error ? (
          <Alert
            title="Não deu para carregar"
            tone="warn"
            action={<Button variant="link" onClick={user.reload}>Tentar de novo</Button>}
          >
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : user.data ? (
          <ProfileContent user={user.data} onSaved={onProfileChange} />
        ) : (
          <p className="shelf-status" aria-busy="true">Carregando perfil…</p>
        )}
      </Container>
    </main>
  )
}

function ProfileContent({ user, onSaved }: { user: User; onSaved: (name: string, email: string) => void }) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>(getInitialTab)

  useEffect(() => {
    function handlePopState() {
      setActiveTab(getInitialTab())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleTabChange(tab: ProfileTabId) {
    setActiveTab(tab)
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href)
      if (tab === 'dados') url.searchParams.delete('aba')
      else url.searchParams.set('aba', tab)
      window.history.replaceState({}, '', url.toString())
    }
  }

  return (
    <div className="profile-layout">
      {/* Card de Identidade com Ação Rápida de Foto */}
      <section className="profile-identity-card" aria-label="Identidade do jogador">
        <div className="profile-identity-card__user">
          <Avatar name={user.name} size="lg" userId={user.id} />
          <div className="profile-identity-card__meta">
            <small>{user.role === 'ADMIN' ? 'Administrador' : 'Jogador'}</small>
            <b>{user.name}</b>
            <span>{user.email}</span>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleTabChange('foto')}
          >
            <CameraIcon />
            Editar foto
          </Button>
        </div>
      </section>

      {/* Navegação por Abas */}
      <ProfileTabs activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Conteúdo da Aba Selecionada */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'dados' && (
          <ProfilePersonalData user={user} onSaved={onSaved} />
        )}
        {activeTab === 'foto' && (
          <ProfilePhotoEditor user={user} />
        )}
        {activeTab === 'atividades' && (
          <ProfileActivities user={user} />
        )}
        {activeTab === 'preferencias' && (
          <ProfilePreferences user={user} />
        )}
      </div>
    </div>
  )
}
