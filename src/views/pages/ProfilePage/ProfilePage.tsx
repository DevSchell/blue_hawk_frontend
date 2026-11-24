import { useEffect, useState, type ReactNode } from 'react'
import { useAsyncList } from '../../../controllers/useAsyncList'
import { useMyProfile, type MyProfileController } from '../../../controllers/useMyProfile'
import { useProfileStats } from '../../../controllers/useProfileStats'
import { getUser, type User } from '../../../models/services/accountService'
import { readUserId } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { ProfileActivities } from './ProfileActivities'
import { ProfileBanner } from './ProfileBanner'
import { ProfilePersonalData } from './ProfilePersonalData'
import { ProfilePhotoEditor } from './ProfilePhotoEditor'
import { ProfilePreferences } from './ProfilePreferences'
import { AppearanceSection, DeleteSection, PasswordSection } from './ProfileSettings'
import { ProfileTabs } from './ProfileTabs'
import { resolveProfileTab, type ProfileTabId } from './profileUtils'
import '../AccountPages.css'
import './ProfilePage.css'

function getInitialTab(): ProfileTabId {
  return typeof window === 'undefined' ? 'dados' : resolveProfileTab(window.location.search)
}

type ProfilePageProps = {
  onSignIn: () => void
  onProfileChange: (name: string, email: string) => void
  /** Encerra a sessão (depois de excluir a conta) */
  onSignOut: () => void
}

/** Meu Perfil: ficha do jogador no topo e, ao lado do menu, o perfil e as configurações da conta */
export function ProfilePage({ onSignIn, onProfileChange, onSignOut }: ProfilePageProps) {
  const userId = readUserId()
  const user = useAsyncList((signal) => (userId ? getUser(userId, signal) : Promise.resolve(null)))

  if (userId && user.data) {
    return <ProfileContent user={user.data} onSaved={onProfileChange} onSignOut={onSignOut} />
  }

  return (
    <main className="page">
      <Container>
        <PageHeader title="Meu Perfil" />
        {!userId ? (
          <EmptyState
            icon={<Raven variant="noite" />}
            title="Entre para ver o seu perfil"
            action={
              <span className="shelf-empty__action">
                <Button onClick={onSignIn}>Entrar</Button>
              </span>
            }
          >
            Seus dados e configurações ficam salvos na sua conta.
          </EmptyState>
        ) : user.error ? (
          <Alert
            title="Não deu para carregar"
            tone="warn"
            action={
              <Button variant="link" onClick={user.reload}>
                Tentar de novo
              </Button>
            }
          >
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : (
          <LoadingCard message="Carregando perfil…" />
        )}
      </Container>
    </main>
  )
}

type ProfileContentProps = {
  user: User
  onSaved: (name: string, email: string) => void
  onSignOut: () => void
}

function ProfileContent({ user, onSaved, onSignOut }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>(getInitialTab)
  const stats = useProfileStats(user.id)
  const myProfile = useMyProfile()

  useEffect(() => {
    const handlePopState = () => setActiveTab(getInitialTab())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleTabChange(tab: ProfileTabId) {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    if (tab === 'dados') url.searchParams.delete('aba')
    else url.searchParams.set('aba', tab)
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <main className="page profile-page">
      <Container>
        <ProfileBanner user={user} stats={stats} onEditPhoto={() => handleTabChange('foto')} />

        <div className="profile-layout">
          <ProfileTabs activeTab={activeTab} onSelectTab={handleTabChange} />

          {/* key: trocar de aba remonta o painel, que entra com a transição */}
          <div
            key={activeTab}
            className="profile-layout__panel"
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === 'dados' && (
              <NeedsProfile myProfile={myProfile}>
                <ProfilePersonalData user={user} myProfile={myProfile} onSaved={onSaved} />
              </NeedsProfile>
            )}
            {activeTab === 'foto' && <ProfilePhotoEditor user={user} myProfile={myProfile} />}
            {activeTab === 'atividades' && <ProfileActivities stats={stats} />}
            {activeTab === 'preferencias' && (
              <NeedsProfile myProfile={myProfile}>
                <ProfilePreferences myProfile={myProfile} />
              </NeedsProfile>
            )}
            {activeTab === 'aparencia' && <AppearanceSection />}
            {activeTab === 'senha' && <PasswordSection userId={user.id} />}
            {activeTab === 'conta' && <DeleteSection userId={user.id} onDeleted={onSignOut} />}
          </div>
        </div>
      </Container>
    </main>
  )
}

/** Mostra o conteúdo só depois que o perfil da conta carregou (ou avisa do erro) */
function NeedsProfile({ myProfile, children }: { myProfile: MyProfileController; children: ReactNode }) {
  if (myProfile.profile) return <>{children}</>
  if (myProfile.error) {
    return (
      <Alert
        title="Não deu para carregar seu perfil"
        tone="warn"
        action={
          <Button variant="link" onClick={myProfile.reload}>
            Tentar de novo
          </Button>
        }
      >
        Verifique a conexão e tente outra vez.
      </Alert>
    )
  }
  return <LoadingCard message="Carregando seu perfil…" />
}
