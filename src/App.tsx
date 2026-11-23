import { useEffect } from 'react'
import { useAuthController } from './controllers/useAuthController'
import { registerLoginPrompt } from './models/loginPrompt'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
import {
  ACCOUNT_ROUTES,
  currentPath,
  MY_MATCHES_PATH,
  PLAY_PATH,
  PRIVACY_PATH,
  REVIEW_PATH,
  TERMS_PATH,
} from './views/layout/navigation'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import { LegalPage } from './views/pages/LegalPage/LegalPage'
import { PRIVACY, TERMS } from './views/pages/LegalPage/legalContent'
import { PlayPage } from './views/pages/PlayPage/PlayPage'
import { ProfilePage } from './views/pages/ProfilePage/ProfilePage'
import { ReviewPage } from './views/pages/ReviewPage/ReviewPage'
import { SettingsPage } from './views/pages/SettingsPage/SettingsPage'
import { ShelfPage } from './views/pages/ShelfPage/ShelfPage'
import { StorePage } from './views/pages/StorePage/StorePage'

function App() {
  const {
    session,
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    closeLogin,
    openRegister,
    closeRegister,
    completeLogin,
    updateProfile,
    logout,
  } = useAuthController()
  const path = currentPath()

  // Qualquer parte da interface pode pedir login (ex.: curtir sem estar logado)
  useEffect(() => registerLoginPrompt(openLogin), [openLogin])

  // "Minhas Partidas" agora é a aba do Jogue: o endereço antigo continua funcionando
  useEffect(() => {
    if (path === ACCOUNT_ROUTES.matches) window.location.replace(MY_MATCHES_PATH)
  }, [path])

  // Remonta a página ao entrar/sair, para buscar de novo com (ou sem) o token
  const pageKey = session?.email ?? 'visitante'

  function renderPage() {
    switch (path) {
      case '/loja':
        return <StorePage key={pageKey} />
      case PLAY_PATH:
        return <PlayPage key={pageKey} onSignIn={openLogin} />
      case ACCOUNT_ROUTES.shelf:
        return (
          <ShelfPage
            key={pageKey}
            onSignIn={openLogin}
            onGoToFeed={() => {
              window.location.href = '/'
            }}
          />
        )
      case ACCOUNT_ROUTES.matches:
        // O efeito acima redireciona; nada a mostrar enquanto isso
        return null
      case ACCOUNT_ROUTES.profile:
        return <ProfilePage onSignIn={openLogin} onProfileChange={updateProfile} />
      case ACCOUNT_ROUTES.settings:
        return <SettingsPage key={pageKey} onSignIn={openLogin} onSignOut={logout} />
      case REVIEW_PATH:
        return <ReviewPage key={pageKey} onSignIn={openLogin} />
      case TERMS_PATH:
        return <LegalPage document={TERMS} path={TERMS_PATH} />
      case PRIVACY_PATH:
        return <LegalPage document={PRIVACY} path={PRIVACY_PATH} />
      default:
        return <FeedPage key={pageKey} />
    }
  }

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {renderPage()}
      {isLoginOpen && <LoginModal onLogin={completeLogin} onClose={closeLogin} onSwitchToRegister={openRegister} />}
      {isRegisterOpen && (
        <RegisterModal onRegister={completeLogin} onClose={closeRegister} onSwitchToLogin={openLogin} />
      )}
    </AppLayout>
  )
}

export default App
