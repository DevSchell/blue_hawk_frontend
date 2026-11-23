import { useEffect } from 'react'
import { useAuthController } from './controllers/useAuthController'
import { registerLoginPrompt } from './models/loginPrompt'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
import { currentPath, PLAY_PATH, PRIVACY_PATH, REVIEW_PATH, SHELF_PATH, TERMS_PATH } from './views/layout/navigation'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import { PlayPage } from './views/pages/PlayPage/PlayPage'
import { ReviewPage } from './views/pages/ReviewPage/ReviewPage'
import { StorePage } from './views/pages/StorePage/StorePage'
import { LegalPage } from './views/pages/LegalPage/LegalPage'
import { PRIVACY, TERMS } from './views/pages/LegalPage/legalContent'
import { ShelfPage } from './views/pages/ShelfPage/ShelfPage'

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
    logout,
  } = useAuthController()
  const path = currentPath()

  // Qualquer parte da interface pode pedir login (ex.: curtir sem estar logado)
  useEffect(() => registerLoginPrompt(openLogin), [openLogin])

  // key em cada página: remonta ao entrar/sair, para buscar de novo com (ou sem) o token
  const sessionKey = session?.email ?? 'visitante'

  function renderPage() {
    switch (path) {
      case REVIEW_PATH:
        return <ReviewPage key={sessionKey} onSignIn={openLogin} />
      case SHELF_PATH:
        return (
          <ShelfPage
            key={sessionKey}
            onSignIn={openLogin}
            onGoToFeed={() => {
              window.location.href = '/'
            }}
          />
        )
      case TERMS_PATH:
        return <LegalPage document={TERMS} path={TERMS_PATH} />
      case PRIVACY_PATH:
        return <LegalPage document={PRIVACY} path={PRIVACY_PATH} />
      case PLAY_PATH:
        return <PlayPage key={sessionKey} onSignIn={openLogin} />
      case '/loja':
        return <StorePage key={sessionKey} />
      default:
        return <FeedPage key={sessionKey} />
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
